const catchAsync = require('../utils/catchAsync');
const { getActivePublicKeyInfo } = require('../config/hybridCrypto');

/**
 * GET /api/crypto/public-key
 *
 * Publica la clave pública ECDH P-256 vigente del servidor (y su
 * keyId) para que Angular pueda derivar el secreto compartido antes
 * de cifrar un payload. Nunca expone la clave privada.
 */
exports.getPublicKey = catchAsync(async (req, res) => {
  const info = getActivePublicKeyInfo();
  res.json({ success: true, data: info });
});
