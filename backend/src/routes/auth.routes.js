const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

const router = Router();

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('lastName').trim().notEmpty().withMessage('El apellido es obligatorio.'),
    body('email').isEmail().withMessage('Correo inválido.').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres.'),
    body('phone').optional().trim(),
    body('birthDate').optional().isISO8601().withMessage('Fecha de nacimiento inválida.'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Correo inválido.').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
  ],
  validate,
  authController.login
);

router.post('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.me);

module.exports = router;
