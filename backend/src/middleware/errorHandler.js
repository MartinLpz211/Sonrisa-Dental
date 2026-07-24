const env = require('../config/env');

/**
 * Middleware de manejo de errores de Express (4 parámetros: debe
 * mantener esa firma exacta para que Express lo reconozca como tal).
 *
 * Reglas:
 * - Si es un AppError (isOperational), respondemos su mensaje y statusCode.
 * - Si es un error de Prisma con código conocido, lo traducimos a algo legible.
 * - Cualquier otro error se trata como un fallo interno: no exponemos
 *   detalles internos al cliente, solo un mensaje genérico (y en
 *   desarrollo, además el stack para depurar).
 */
function errorHandler(err, req, res, next) {
  // Error de validación de Prisma (ej. campo único duplicado)
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: `Ya existe un registro con ese valor único: ${err.meta?.target}`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado.',
    });
  }

  const statusCode = err.isOperational ? err.statusCode : 500;
  const message = err.isOperational ? err.message : 'Error interno del servidor.';

  if (!err.isOperational) {
    // Esto sí queremos verlo en los logs del servidor aunque no se lo
    // mandemos al cliente.
    console.error('ERROR NO CONTROLADO:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv === 'development' && !err.isOperational
      ? { stack: err.stack }
      : {}),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFoundHandler };
