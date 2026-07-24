const catchAsync = require('../utils/catchAsync');
const serviceService = require('../services/service.service');

/**
 * GET /api/services?search=&isActive=&page=&limit=
 */
exports.getAll = catchAsync(async (req, res) => {
  const { search, isActive, page, limit } = req.query;

  const result = await serviceService.getAllServices({
    search,
    isActive: isActive === undefined ? undefined : isActive === 'true',
    page,
    limit,
  });

  res.json({ success: true, data: result });
});

/**
 * GET /api/services/:id
 */
exports.getById = catchAsync(async (req, res) => {
  const service = await serviceService.getServiceById(req.params.id);
  res.json({ success: true, data: { service } });
});

/**
 * POST /api/services
 */
exports.create = catchAsync(async (req, res) => {
  const service = await serviceService.createService(req.body);
  res.status(201).json({ success: true, data: { service }, message: 'Servicio creado correctamente.' });
});

/**
 * PATCH /api/services/:id
 */
exports.update = catchAsync(async (req, res) => {
  const service = await serviceService.updateService(req.params.id, req.body);
  res.json({ success: true, data: { service }, message: 'Servicio actualizado correctamente.' });
});

/**
 * PATCH /api/services/:id/deactivate
 */
exports.deactivate = catchAsync(async (req, res) => {
  const service = await serviceService.deactivateService(req.params.id);
  res.json({ success: true, data: { service }, message: 'Servicio desactivado correctamente.' });
});

/**
 * PATCH /api/services/:id/reactivate
 */
exports.reactivate = catchAsync(async (req, res) => {
  const service = await serviceService.reactivateService(req.params.id);
  res.json({ success: true, data: { service }, message: 'Servicio reactivado correctamente.' });
});
