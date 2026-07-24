const catchAsync = require('../utils/catchAsync');
const dashboardService = require('../services/dashboard.service');

/**
 * GET /api/dashboard/stats
 * Únicamente ADMIN (ver dashboard.routes.js). Devuelve todo lo que
 * necesitan las tarjetas, listas y gráfica del Dashboard principal.
 */
exports.getStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();
  res.json({ success: true, data: stats });
});
