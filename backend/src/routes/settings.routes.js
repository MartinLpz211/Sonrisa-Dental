const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Rutas de ajustes protegidas y solo para ADMIN
router.use(authenticate);

router.get('/', settingsController.getSettings);
router.put('/', authorize('ADMIN'), settingsController.updateSettings);

module.exports = router;
