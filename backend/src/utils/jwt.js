const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Firma un JWT. El payload incluye el nombre del rol (no solo el id)
 * para que el middleware de autorización no necesite consultar la
 * base de datos en cada request protegido.
 */
function generateToken({ id, email, roleName }) {
  return jwt.sign({ id, email, role: roleName }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

/**
 * Verifica y decodifica un JWT. Lanza si es inválido o expiró
 * (jsonwebtoken ya arroja TokenExpiredError / JsonWebTokenError).
 */
function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { generateToken, verifyToken };
