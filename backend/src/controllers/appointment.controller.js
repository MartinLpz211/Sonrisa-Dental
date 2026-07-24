const catchAsync = require('../utils/catchAsync');
const appointmentService = require('../services/appointment.service');

exports.getAll = catchAsync(async (req, res) => {
  const { search, serviceId, status, date, dateFrom, dateTo, page, limit } = req.query;

  const result = await appointmentService.getAllAppointments({
    search,
    serviceId,
    status,
    date,
    dateFrom,
    dateTo,
    page,
    limit,
  });

  res.json({ success: true, data: result });
});

/**
 * GET /api/appointments/availability?date=&serviceId=&excludeAppointmentId=
 */
exports.getAvailability = catchAsync(async (req, res) => {
  const { date, serviceId, excludeAppointmentId } = req.query;

  const result = await appointmentService.getAvailability({ date, serviceId, excludeAppointmentId });

  res.json({ success: true, data: result });
});

/**
 * POST /api/appointments
 */
exports.create = catchAsync(async (req, res) => {
  const { patientId, serviceId, date, startTime, notes } = req.body;

  const appointment = await appointmentService.createAppointment({
    patientId,
    serviceId,
    date,
    startTime,
    notes,
    handledById: req.user.id,
  });

  res.status(201).json({ success: true, data: { appointment }, message: 'Cita creada correctamente.' });
});

/**
 * PATCH /api/appointments/:id/reschedule
 */
exports.reschedule = catchAsync(async (req, res) => {
  const { date, startTime } = req.body;

  const appointment = await appointmentService.rescheduleAppointment(
    req.params.id,
    { date, startTime },
    req.user.id
  );

  res.json({ success: true, data: { appointment }, message: 'Cita reagendada correctamente.' });
});

// ==========================================
// FUNCIONES PARA PACIENTES (RUTAS /me)
// ==========================================

exports.getMine = catchAsync(async (req, res) => {
  const result = await appointmentService.getAllAppointments({
    patientId: req.user.id, // Filtrar solo por el paciente actual
    // Ignoramos paginación compleja para los pacientes y les mandamos todo o un límite alto (opcional)
  });

  res.json({ success: true, data: result });
});

exports.createMine = catchAsync(async (req, res) => {
  const { serviceId, date, startTime, notes } = req.body;

  const appointment = await appointmentService.createAppointment({
    patientId: req.user.id, // Forzar ID del token
    serviceId,
    date,
    startTime,
    notes,
    handledById: null, // Creado por el propio paciente
  });

  res.status(201).json({ success: true, data: { appointment }, message: 'Tu cita ha sido agendada con éxito.' });
});

exports.rescheduleMine = catchAsync(async (req, res) => {
  const { date, startTime } = req.body;

  const appointment = await appointmentService.rescheduleAppointment(
    req.params.id,
    { date, startTime },
    null, // handledById (no es admin)
    req.user.id // Pasar el patientId para verificar pertenencia
  );

  res.json({ success: true, data: { appointment }, message: 'Tu cita ha sido reagendada correctamente.' });
});

exports.cancelMine = catchAsync(async (req, res) => {
  const appointment = await appointmentService.cancelAppointment(req.params.id, req.user.id);
  res.json({ success: true, data: { appointment }, message: 'Tu cita ha sido cancelada.' });
});

exports.updateNotesMine = catchAsync(async (req, res) => {
  const { notes } = req.body;
  const appointment = await appointmentService.updateAppointmentNotes(req.params.id, notes, req.user.id);
  res.json({ success: true, data: { appointment }, message: 'Notas de la cita actualizadas.' });
});