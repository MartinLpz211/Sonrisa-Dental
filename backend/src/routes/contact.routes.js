const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const contactController = require('../controllers/contact.controller');

const router = Router();

// El envío del formulario de Contacto es público: lo usa cualquier
// visitante de la landing, no requiere sesión iniciada.
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('email').trim().isEmail().withMessage('Ingresa un correo válido.'),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('El mensaje es obligatorio.')
      .isLength({ min: 10 })
      .withMessage('El mensaje debe tener al menos 10 caracteres.'),
  ],
  validate,
  contactController.create
);

// Revisar los mensajes recibidos sí requiere sesión de ADMIN.
router.get('/', authenticate, authorize('ADMIN'), contactController.getAll);

module.exports = router;
