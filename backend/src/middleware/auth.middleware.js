const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { verifyToken } = require('../utils/jwt');

/**
 * Protege una ruta: exige un JWT válido y que no esté en la blacklist
 * (es decir, que el usuario no haya hecho logout con ese token).
 *
 * Al terminar, deja disponible en req.user:
 *   { id, email, role }
 * para que los controllers y authorize() lo usen sin volver a tocar la BD.
 */
const authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No se proporcionó un token de autenticación.', 401);
  }

  const token = authHeader.split(' ')[1];

  const blacklisted = await prisma.blacklistedToken.findUnique({
    where: { token },
  });
  if (blacklisted) {
    throw new AppError('La sesión ha sido cerrada. Inicia sesión de nuevo.', 401);
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new AppError('Token inválido o expirado.', 401);
  }

  req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
  req.token = token; // lo usará el logout para blacklistearlo
  next();
});

/**
 * Restringe una ruta a uno o más roles.
 * Uso: router.get('/admin/pacientes', authenticate, authorize('ADMIN'), ...)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('No tienes permisos para realizar esta acción.', 403)
      );
    }
    next();
  };
}

module.exports = { authenticate, authorize };
