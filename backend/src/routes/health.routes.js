const { Router } = require('express');
const { ping, pingDb } = require('../controllers/health.controller');

const router = Router();

router.get('/', ping);
router.get('/db', pingDb);

module.exports = router;
