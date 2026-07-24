const { Router } = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const patientController = require('../controllers/patient.controller');

const router = Router();

// Todo el módulo es exclusivo del administrador.
router.use(authenticate, authorize('ADMIN'));

router.get(
  '/',
  [
    query('search').optional().trim(),
    query('isActive').optional().isBoolean().withMessage('isActive debe ser true o false.'),
    query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero positivo.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit debe ser un entero entre 1 y 100.'),
  ],
  validate,
  patientController.getAll
);

router.get(
  '/:id',
  [param('id').isInt().withMessage('id inválido.')],
  validate,
  patientController.getById
);

router.patch(
  '/:id',
  [
    param('id').isInt().withMessage('id inválido.'),
    body('firstName').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
    body('lastName').optional().trim().notEmpty().withMessage('El apellido no puede estar vacío.'),
    body('email').optional().isEmail().withMessage('Correo inválido.').normalizeEmail(),
    body('phone').optional({ nullable: true }).trim(),
    body('birthDate')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('Fecha de nacimiento inválida.'),
  ],
  validate,
  patientController.update
);

router.patch(
  '/:id/deactivate',
  [param('id').isInt().withMessage('id inválido.')],
  validate,
  patientController.deactivate
);

router.patch(
  '/:id/reactivate',
  [param('id').isInt().withMessage('id inválido.')],
  validate,
  patientController.reactivate
);

module.exports = router;
