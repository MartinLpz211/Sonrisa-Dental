const { PrismaClient } = require('@prisma/client');
const env = require('./env');

/**
 * Instancia única de PrismaClient para toda la aplicación.
 *
 * Por qué: PrismaClient mantiene un pool de conexiones a Postgres.
 * Si cada archivo hiciera "new PrismaClient()", tendríamos múltiples
 * pools abiertos y en desarrollo (con nodemon reiniciando el proceso)
 * esto agota las conexiones disponibles de la base de datos.
 *
 * Con este módulo, cualquier archivo hace:
 *   const prisma = require('../config/prisma');
 * y siempre reutiliza la misma instancia.
 */
const prisma = new PrismaClient({
  log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
