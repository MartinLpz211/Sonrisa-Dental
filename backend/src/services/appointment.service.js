const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const businessHours = require('../config/businessHours');

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const APPOINTMENT_SELECT = {
  id: true,
  date: true,
  startTime: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  patient: { select: { id: true, firstName: true, lastName: true, email: true } },
  service: { select: { id: true, name: true, price: true, duration: true, imageUrl: true } },
};

function getDayRange(dateStr) {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function toHHMM(minutes) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/** true si `date` (Date, hora 00:00) es estrictamente anterior al día de hoy */
function isPastDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

// ------------------------------------------------------------------
// Listado (ya existía; se le agrega soporte de rango dateFrom/dateTo
// además del filtro por día exacto `date`, para poblar el calendario
// con un solo request por mes visible)
// ------------------------------------------------------------------
async function getAllAppointments({
  search,
  serviceId,
  status,
  date,
  dateFrom,
  dateTo,
  patientId,
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
} = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(limit) || DEFAULT_PAGE_SIZE));

  let dateWhere = {};
  if (date) {
    const { start, end } = getDayRange(date);
    dateWhere = { date: { gte: start, lt: end } };
  } else if (dateFrom || dateTo) {
    dateWhere = {
      date: {
        ...(dateFrom ? { gte: getDayRange(dateFrom).start } : {}),
        ...(dateTo ? { lt: getDayRange(dateTo).end } : {}),
      },
    };
  }

  const where = {
    ...(serviceId ? { serviceId: Number(serviceId) } : {}),
    ...(status ? { status } : {}),
    ...(patientId ? { patientId: Number(patientId) } : {}),
    ...dateWhere,
    ...(search
      ? {
          patient: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        }
      : {}),
  };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      select: APPOINTMENT_SELECT,
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    appointments,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
}

// ------------------------------------------------------------------
// Disponibilidad de horarios para un día + servicio
// ------------------------------------------------------------------
async function getAvailability({ date, serviceId, excludeAppointmentId }) {
  if (!date) throw new AppError('date es obligatorio.', 400);
  if (!serviceId) throw new AppError('serviceId es obligatorio.', 400);

  const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
  if (!service || !service.isActive) {
    throw new AppError('El servicio no existe o no está disponible.', 404);
  }

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  if (isPastDate(dayStart)) {
    throw new AppError('No se pueden consultar horarios de fechas pasadas.', 400);
  }

  if (!businessHours.WORKING_DAYS.includes(dayStart.getDay())) {
    return { date, serviceId: service.id, slots: [] }; // día no laboral (ej. domingo)
  }

  const openMin = toMinutes(businessHours.OPEN_TIME);
  const closeMin = toMinutes(businessHours.CLOSE_TIME);
  const duration = service.duration;

  // Citas ya existentes ese día (cualquier servicio: todas comparten
  // el mismo consultorio/horario), excluyendo canceladas y, si aplica,
  // la cita que se está reagendando (no debe chocar consigo misma).
  const { start, end } = getDayRange(date);
  const existing = await prisma.appointment.findMany({
    where: {
      date: { gte: start, lt: end },
      status: { not: 'CANCELADA' },
      ...(excludeAppointmentId ? { id: { not: Number(excludeAppointmentId) } } : {}),
    },
    select: { startTime: true, service: { select: { duration: true } } },
  });

  const occupiedRanges = existing.map((a) => {
    const s = toMinutes(a.startTime);
    return { start: s, end: s + a.service.duration };
  });

  const nowMin = isSameDay(dayStart, new Date()) ? currentMinutesOfDay() : -1;

  const slots = [];
  for (
    let slotStart = openMin;
    slotStart + duration <= closeMin;
    slotStart += businessHours.SLOT_INTERVAL_MINUTES
  ) {
    const slotEnd = slotStart + duration;

    if (slotStart < nowMin) continue; // ya pasó (solo aplica si `date` es hoy)

    const overlaps = occupiedRanges.some((r) => r.start < slotEnd && slotStart < r.end);
    if (!overlaps) slots.push(toHHMM(slotStart));
  }

  return { date, serviceId: service.id, slots };
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function currentMinutesOfDay() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Valida que (date, startTime, serviceId) sea un horario válido:
 * no pasado, dentro del horario laboral, y sin choque con otra cita.
 * Se usa tanto en createAppointment como en rescheduleAppointment.
 */
async function assertSlotIsValid({ date, startTime, serviceId, excludeAppointmentId }) {
  if (!serviceId) {
    throw new AppError('Debes seleccionar un servicio.', 400);
  }

  const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
  if (!service || !service.isActive) {
    throw new AppError('El servicio no existe o no está disponible.', 404);
  }

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  if (isPastDate(dayStart)) {
    throw new AppError('No se pueden agendar citas en fechas pasadas.', 400);
  }

  if (!businessHours.WORKING_DAYS.includes(dayStart.getDay())) {
    throw new AppError('Ese día no hay atención (fuera del horario laboral).', 400);
  }

  const startMin = toMinutes(startTime);
  const endMin = startMin + service.duration;
  const openMin = toMinutes(businessHours.OPEN_TIME);
  const closeMin = toMinutes(businessHours.CLOSE_TIME);

  if (startMin < openMin || endMin > closeMin) {
    throw new AppError(
      `El horario debe estar entre ${businessHours.OPEN_TIME} y ${businessHours.CLOSE_TIME}.`,
      400
    );
  }

  if (isSameDay(dayStart, new Date()) && startMin < currentMinutesOfDay()) {
    throw new AppError('Ese horario ya pasó.', 400);
  }

  const { start, end } = getDayRange(date);
  const sameDayAppointments = await prisma.appointment.findMany({
    where: {
      date: { gte: start, lt: end },
      status: { not: 'CANCELADA' },
      ...(excludeAppointmentId ? { id: { not: Number(excludeAppointmentId) } } : {}),
    },
    select: { startTime: true, service: { select: { duration: true } } },
  });

  const overlaps = sameDayAppointments.some((a) => {
    const s = toMinutes(a.startTime);
    const e = s + a.service.duration;
    return s < endMin && startMin < e;
  });

  if (overlaps) {
    throw new AppError('Ese horario ya está ocupado.', 409);
  }

  return service;
}

// ------------------------------------------------------------------
// Crear cita (usado por el admin desde el calendario)
// ------------------------------------------------------------------
async function createAppointment({ patientId, serviceId, date, startTime, notes, handledById }) {
  if (!patientId) throw new AppError('Debes seleccionar un paciente.', 400);

  const patient = await prisma.user.findFirst({
    where: { id: Number(patientId), role: { name: 'PACIENTE' } },
  });
  if (!patient || !patient.isActive) {
    throw new AppError('El paciente no existe o está inactivo.', 404);
  }

  await assertSlotIsValid({ date, startTime, serviceId });

  const appointment = await prisma.appointment.create({
    data: {
      patientId: Number(patientId),
      serviceId: Number(serviceId),
      date: new Date(date),
      startTime,
      notes: notes || null,
      handledById: handledById || null,
    },
    select: APPOINTMENT_SELECT,
  });

  return appointment;
}

// ------------------------------------------------------------------
// Reagendar cita (usado por el admin desde el calendario o por el paciente)
// Si ownerId está presente, valida que la cita le pertenezca.
// ------------------------------------------------------------------
async function rescheduleAppointment(id, { date, startTime }, handledById, ownerId = null) {
  const current = await prisma.appointment.findUnique({ where: { id: Number(id) } });
  if (!current) throw new AppError('Cita no encontrada.', 404);

  if (ownerId && current.patientId !== Number(ownerId)) {
    throw new AppError('No tienes permiso para modificar esta cita.', 403);
  }

  if (['CANCELADA', 'COMPLETADA'].includes(current.status)) {
    throw new AppError(`No se puede reagendar una cita ${current.status.toLowerCase()}.`, 400);
  }

  await assertSlotIsValid({
    date,
    startTime,
    serviceId: current.serviceId,
    excludeAppointmentId: id,
  });

  const updated = await prisma.appointment.update({
    where: { id: Number(id) },
    data: { date: new Date(date), startTime, status: 'REAGENDADA', handledById: handledById || null },
    select: APPOINTMENT_SELECT,
  });

  return updated;
}

// ------------------------------------------------------------------
// Cancelar cita (usado por paciente)
// ------------------------------------------------------------------
async function cancelAppointment(id, ownerId) {
  const current = await prisma.appointment.findUnique({ where: { id: Number(id) } });
  if (!current) throw new AppError('Cita no encontrada.', 404);

  if (current.patientId !== Number(ownerId)) {
    throw new AppError('No tienes permiso para cancelar esta cita.', 403);
  }

  if (['CANCELADA', 'COMPLETADA'].includes(current.status)) {
    throw new AppError(`No se puede cancelar una cita ${current.status.toLowerCase()}.`, 400);
  }

  const updated = await prisma.appointment.update({
    where: { id: Number(id) },
    data: { status: 'CANCELADA' },
    select: APPOINTMENT_SELECT,
  });

  return updated;
}

// ------------------------------------------------------------------
// Actualizar notas (usado por paciente)
// ------------------------------------------------------------------
async function updateAppointmentNotes(id, notes, ownerId) {
  const current = await prisma.appointment.findUnique({ where: { id: Number(id) } });
  if (!current) throw new AppError('Cita no encontrada.', 404);

  if (current.patientId !== Number(ownerId)) {
    throw new AppError('No tienes permiso para modificar esta cita.', 403);
  }

  const updated = await prisma.appointment.update({
    where: { id: Number(id) },
    data: { notes: notes || null },
    select: APPOINTMENT_SELECT,
  });

  return updated;
}

module.exports = {
  getAllAppointments,
  getAvailability,
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  updateAppointmentNotes,
};