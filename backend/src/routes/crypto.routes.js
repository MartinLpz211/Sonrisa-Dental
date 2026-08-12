const { Router } = require('express');
const cryptoController = require('../controllers/crypto.controller');

const router = Router();

// Público a propósito: cualquier cliente necesita esta clave ANTES de
// poder autenticarse, así que no puede requerir JWT.
router.get('/public-key', cryptoController.getPublicKey);

module.exports = router;
