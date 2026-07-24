const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const STATUS_VALUES = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA', 'REAGENDADA'];

function getRange(dateFromStr, dateToStr) {
  const start = new Date(dateFromStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateToStr);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1); // exclusivo: incluye todo el día "hasta"
  return { start, end };
}

function dayKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Resumen de citas + ingresos en un rango de fechas [dateFrom, dateTo].
 * Trae las citas del rango una sola vez y agrega todo en memoria
 * (status, servicio, día) en vez de lanzar varias queries de Prisma
 * por cada corte — para el volumen de un consultorio dental esto es
 * más simple y suficientemente rápido que repetir groupBy por cada eje.
 * Solo se cuenta como "ingreso" el precio de citas COMPLETADA: son las
 * únicas que realmente se realizaron y, por lo tanto, se cobraron.
 */
async function getSummary({ dateFrom, dateTo }) {
  if (!dateFrom || !dateTo) {
    throw new AppError('dateFrom y dateTo son obligatorios.', 400);
  }
  if (new Date(dateFrom) > new Date(dateTo)) {
    throw new AppError('dateFrom no puede ser posterior a dateTo.', 400);
  }

  const { start, end } = getRange(dateFrom, dateTo);

  const [appointments, newPatients] = await Promise.all([
    prisma.appointment.findMany({
      where: { date: { gte: start, lt: end } },
      select: {
        date: true,
        status: true,
        service: { select: { id: true, name: true, price: true } },
      },
    }),
    prisma.user.count({
      where: { role: { name: 'PACIENTE' }, createdAt: { gte: start, lt: end } },
    }),
  ]);

  const totals = {
    totalAppointments: appointments.length,
    completedAppointments: 0,
    cancelledAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    rescheduledAppointments: 0,
    totalRevenue: 0,
    newPatients,
  };

  const byServiceMap = new Map(); // serviceId -> { serviceId, name, count, revenue }
  const byStatusMap = new Map(STATUS_VALUES.map((s) => [s, 0]));
  const byDayMap = new Map(); // 'YYYY-MM-DD' -> { date, count, revenue }

  for (const appt of appointments) {
    const isCompleted = appt.status === 'COMPLETADA';
    const revenue = isCompleted ? appt.service.price : 0;

    switch (appt.status) {
      case 'COMPLETADA':
        totals.completedAppointments++;
        break;
      case 'CANCELADA':
        totals.cancelledAppointments++;
        break;
      case 'PENDIENTE':
        totals.pendingAppointments++;
        break;
      case 'CONFIRMADA':
        totals.confirmedAppointments++;
        break;
      case 'REAGENDADA':
        totals.rescheduledAppointments++;
        break;
    }
    totals.totalRevenue += revenue;

    byStatusMap.set(appt.status, (byStatusMap.get(appt.status) ?? 0) + 1);

    const svc = appt.service;
    if (!byServiceMap.has(svc.id)) {
      byServiceMap.set(svc.id, { serviceId: svc.id, name: svc.name, count: 0, revenue: 0 });
    }
    const svcEntry = byServiceMap.get(svc.id);
    svcEntry.count++;
    svcEntry.revenue += revenue;

    const key = dayKey(appt.date);
    if (!byDayMap.has(key)) {
      byDayMap.set(key, { date: key, count: 0, revenue: 0 });
    }
    const dayEntry = byDayMap.get(key);
    dayEntry.count++;
    dayEntry.revenue += revenue;
  }

  const byService = Array.from(byServiceMap.values()).sort((a, b) => b.count - a.count);
  const byStatus = STATUS_VALUES.map((status) => ({ status, count: byStatusMap.get(status) ?? 0 }));
  const byDay = Array.from(byDayMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return {
    range: { dateFrom, dateTo },
    totals,
    byService,
    byStatus,
    byDay,
  };
}

module.exports = { getSummary };
