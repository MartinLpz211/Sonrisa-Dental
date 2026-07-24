const { Router } = require('express');
const { query, body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const appointmentController = require('../controllers/appointment.controller');

const router = Router();

// Todo el módulo de citas requiere sesión iniciada. Antes esta línea
// no existía y `authenticate` se importaba pero nunca se usaba, así
// que req.user quedaba undefined en TODAS las rutas de este archivo
// (rompía tanto el listado de admin como /me del paciente).
router.use(authenticate);

// ==========================================
// RUTAS PARA PACIENTES Y ADMIN
// ==========================================

const STATUS_VALUES = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA', 'REAGENDADA'];

// Todos pueden ver disponibilidad
router.get(
  '/availability',
  [
    query('date').isISO8601().withMessage('date es obligatorio, formato YYYY-MM-DD.'),
    query('serviceId').isInt().withMessage('serviceId es obligatorio.'),
    query('excludeAppointmentId').optional().isInt(),
  ],
  validate,
  appointmentController.getAvailability
);

// Pacientes gestionando sus propias citas
router.get('/me', appointmentController.getMine);

router.post(
  '/me',
  [
    body('serviceId').isInt().withMessage('serviceId es obligatorio.'),
    body('date').isISO8601().withMessage('date es obligatorio, formato YYYY-MM-DD.'),
    body('startTime')
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
      .withMessage('startTime debe tener formato HH:mm.'),
    body('notes').optional({ nullable: true }).trim(),
  ],
  validate,
  appointmentController.createMine
);

router.patch(
  '/me/:id/reschedule',
  [
    param('id').isInt().withMessage('id inválido.'),
    body('date').isISO8601().withMessage('date es obligatorio, formato YYYY-MM-DD.'),
    body('startTime')
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
      .withMessage('startTime debe tener formato HH:mm.'),
  ],
  validate,
  appointmentController.rescheduleMine
);

router.patch(
  '/me/:id/cancel',
  [param('id').isInt().withMessage('id inválido.')],
  validate,
  appointmentController.cancelMine
);

router.patch(
  '/me/:id/notes',
  [
    param('id').isInt().withMessage('id inválido.'),
    body('notes').optional({ nullable: true }).trim(),
  ],
  validate,
  appointmentController.updateNotesMine
);


// ==========================================
// RUTAS EXCLUSIVAS PARA ADMINISTRADORES
// ==========================================
router.use(authorize('ADMIN'));

router.get(
  '/',
  [
    query('search').optional().trim(),
    query('serviceId').optional().isInt().withMessage('serviceId debe ser un entero.'),
    query('status').optional().isIn(STATUS_VALUES).withMessage(`status debe ser uno de: ${STATUS_VALUES.join(', ')}.`),
    query('date').optional().isISO8601().withMessage('date debe tener formato YYYY-MM-DD.'),
    query('dateFrom').optional().isISO8601().withMessage('dateFrom debe tener formato YYYY-MM-DD.'),
    query('dateTo').optional().isISO8601().withMessage('dateTo debe tener formato YYYY-MM-DD.'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  appointmentController.getAll
);

router.post(
  '/',
  [
    body('patientId').isInt().withMessage('patientId es obligatorio.'),
    body('serviceId').isInt().withMessage('serviceId es obligatorio.'),
    body('date').isISO8601().withMessage('date es obligatorio, formato YYYY-MM-DD.'),
    body('startTime')
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
      .withMessage('startTime debe tener formato HH:mm.'),
    body('notes').optional({ nullable: true }).trim(),
  ],
  validate,
  appointmentController.create
);

router.patch(
  '/:id/reschedule',
  [
    param('id').isInt().withMessage('id inválido.'),
    body('date').isISO8601().withMessage('date es obligatorio, formato YYYY-MM-DD.'),
    body('startTime')
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
      .withMessage('startTime debe tener formato HH:mm.'),
  ],
  validate,
  appointmentController.reschedule
);

module.exports = router;