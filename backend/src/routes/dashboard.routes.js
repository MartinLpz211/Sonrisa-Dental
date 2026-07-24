const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

const router = Router();

// Todo lo que necesitan las tarjetas del Dashboard principal del admin
// en una sola llamada: totales, próximas citas, últimos pacientes,
// servicios más solicitados y la serie mensual para la gráfica.
router.get('/stats', authenticate, authorize('ADMIN'), dashboardController.getStats);

module.exports = router;
