const prisma = require('../config/prisma');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/health
 * Confirma que el servidor Express está vivo.
 */
exports.ping = (req, res) => {
  res.json({ success: true, message: 'API funcionando correctamente.' });
};

/**
 * GET /api/health/db
 * Confirma que Prisma puede conectarse a PostgreSQL, ejecutando
 * una query cruda simple. No depende de que existan modelos/tablas
 * todavía, por lo que sirve para probar la conexión antes de
 * definir el schema completo.
 */
exports.pingDb = catchAsync(async (req, res) => {
  await prisma.$queryRaw`SELECT 1 as result`;
  res.json({ success: true, message: 'Conexión a PostgreSQL exitosa.' });
});
