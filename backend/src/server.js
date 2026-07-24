const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');

const server = app.listen(env.port, () => {
  console.log(`Servidor escuchando en http://localhost:${env.port}`);
  console.log(`Entorno: ${env.nodeEnv}`);
});

/**
 * Cierre ordenado: al recibir señal de terminación (Ctrl+C, o el
 * gestor de procesos en producción), cerramos primero el servidor
 * HTTP (dejamos de aceptar requests nuevas) y luego desconectamos
 * Prisma, para no dejar conexiones a Postgres colgadas.
 */
async function shutdown() {
  console.log('Cerrando servidor...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Servidor y conexión a base de datos cerrados.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
