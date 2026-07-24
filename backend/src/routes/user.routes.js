const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Todas las rutas de usuario requieren estar autenticado
router.use(authenticate);

router.put('/profile', userController.updateProfile);
router.put('/preferences', userController.updatePreferences);
router.put('/password', userController.changePassword);

module.exports = router;
