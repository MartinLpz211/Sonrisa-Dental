const catchAsync = require('../utils/catchAsync');
const patientService = require('../services/patient.service');

/**
 * GET /api/patients?search=&isActive=&page=&limit=
 * Lista paginada de pacientes, con búsqueda opcional por nombre,
 * apellido, correo o teléfono, y filtro por estado activo/inactivo.
 */
exports.getAll = catchAsync(async (req, res) => {
  const { search, isActive, page, limit } = req.query;

  const result = await patientService.getAllPatients({
    search,
    isActive: isActive === undefined ? undefined : isActive === 'true',
    page,
    limit,
  });

  res.json({ success: true, data: result });
});

/**
 * GET /api/patients/:id
 */
exports.getById = catchAsync(async (req, res) => {
  const patient = await patientService.getPatientById(req.params.id);
  res.json({ success: true, data: { patient } });
});

/**
 * PATCH /api/patients/:id
 * Edita datos de contacto/perfil (no password, no rol, no isActive).
 */
exports.update = catchAsync(async (req, res) => {
  const patient = await patientService.updatePatient(req.params.id, req.body);
  res.json({ success: true, data: { patient }, message: 'Paciente actualizado correctamente.' });
});

/**
 * PATCH /api/patients/:id/deactivate
 */
exports.deactivate = catchAsync(async (req, res) => {
  const patient = await patientService.deactivatePatient(req.params.id);
  res.json({ success: true, data: { patient }, message: 'Paciente desactivado correctamente.' });
});

/**
 * PATCH /api/patients/:id/reactivate
 */
exports.reactivate = catchAsync(async (req, res) => {
  const patient = await patientService.reactivatePatient(req.params.id);
  res.json({ success: true, data: { patient }, message: 'Paciente reactivado correctamente.' });
});
