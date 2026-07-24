const { Router } = require('express');
const { query } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const reportController = require('../controllers/report.controller');

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get(
  '/summary',
  [
    query('dateFrom').optional().isISO8601().withMessage('dateFrom debe tener formato YYYY-MM-DD.'),
    query('dateTo').optional().isISO8601().withMessage('dateTo debe tener formato YYYY-MM-DD.'),
  ],
  validate,
  reportController.getSummary
);

module.exports = router;
