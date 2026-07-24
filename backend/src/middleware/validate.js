const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Se coloca después de las cadenas de validación de express-validator
 * en cada ruta. Si hubo errores, los junta en un solo mensaje y corta
 * la petición con 400, antes de que llegue al controller.
 *
 * Uso:
 *   router.post('/login', [body('email').isEmail(), ...], validate, controller.login)
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const message = errors
    .array()
    .map((e) => e.msg)
    .join(' | ');

  next(new AppError(message, 400));
}

module.exports = validate;
