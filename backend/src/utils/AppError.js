/**
 * Error "esperado" de la aplicación (ej. "paciente no encontrado",
 * "credenciales inválidas", "horario no disponible").
 *
 * Se diferencia de un error de programación porque:
 * - Tiene un statusCode HTTP válido para responder al cliente.
 * - Su mensaje es seguro de mostrar al usuario final.
 * - isOperational = true le indica al errorHandler que puede
 *   responder con el mensaje tal cual, sin ocultarlo ni loguearlo
 *   como un fallo crítico del servidor.
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
