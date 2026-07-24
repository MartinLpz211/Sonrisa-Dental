const { Router } = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const serviceController = require('../controllers/service.controller');

const router = Router();

// Leer el catálogo lo puede hacer cualquier usuario autenticado
// (el paciente necesita ver los servicios para agendar). Crear,
// editar, desactivar y reactivar sigue siendo exclusivo de ADMIN,
// y se protege ruta por ruta más abajo.
router.use(authenticate);

const serviceBodyValidators = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('description').trim().notEmpty().withMessage('La descripción es obligatoria.'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0.'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('La duración debe ser un entero en minutos, mayor a 0.'),
  body('imageUrl').optional({ nullable: true }).isURL().withMessage('imageUrl debe ser una URL válida.'),
];

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
  serviceController.getAll
);

router.get(
  '/:id',
  [param('id').isInt().withMessage('id inválido.')],
  validate,
  serviceController.getById
);

router.post('/', authorize('ADMIN'), serviceBodyValidators, validate, serviceController.create);

router.patch(
  '/:id',
  authorize('ADMIN'),
  [
    param('id').isInt().withMessage('id inválido.'),
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
    body('description').optional().trim().notEmpty().withMessage('La descripción no puede estar vacía.'),
    body('price').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0.'),
    body('duration').optional().isInt({ min: 1 }).withMessage('La duración debe ser un entero en minutos, mayor a 0.'),
    body('imageUrl').optional({ nullable: true }).isURL().withMessage('imageUrl debe ser una URL válida.'),
  ],
  validate,
  serviceController.update
);

router.patch(
  '/:id/deactivate',
  authorize('ADMIN'),
  [param('id').isInt().withMessage('id inválido.')],
  validate,
  serviceController.deactivate
);

router.patch(
  '/:id/reactivate',
  authorize('ADMIN'),
  [param('id').isInt().withMessage('id inválido.')],
  validate,
  serviceController.reactivate
);

module.exports = router;
