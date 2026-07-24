require('dotenv').config();

/**
 * Centraliza el acceso a las variables de entorno y valida
 * que las obligatorias existan antes de arrancar el servidor.
 * Así, si falta algo, el error aparece al inicio (fail fast)
 * y no en medio de una request.
 */
const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Falta la variable de entorno requerida: ${key}`);
  }
}

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
};
