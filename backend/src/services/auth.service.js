const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { generateToken, verifyToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

/**
 * Quita el password del objeto user antes de devolverlo al cliente.
 * Nunca debe salir el hash hacia el frontend.
 */
function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Registra un paciente nuevo.
 * (El registro de administradores no se expone públicamente por
 * seguridad; un admin se crea manualmente o desde un endpoint interno
 * protegido que agregaremos en el módulo de gestión de usuarios.)
 */
async function register({ firstName, lastName, email, password, phone, birthDate }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Ya existe una cuenta registrada con ese correo.', 409);
  }

  const patientRole = await prisma.role.findUnique({ where: { name: 'PACIENTE' } });
  if (!patientRole) {
    // Esto solo pasaría si no se corrió el seed de roles.
    throw new AppError(
      'El rol PACIENTE no existe. Corre "npx prisma db seed" primero.',
      500
    );
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      birthDate: birthDate ? new Date(birthDate) : null,
      roleId: patientRole.id,
    },
    include: { role: true },
  });

  const token = generateToken({ id: user.id, email: user.email, roleName: user.role.name });

  return { user: sanitizeUser(user), token };
}

/**
 * Inicia sesión: valida credenciales y devuelve un JWT nuevo.
 */
async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  // Mensaje genérico a propósito: no revelar si el error fue el
  // correo o el password (evita enumeración de cuentas existentes).
  if (!user) {
    throw new AppError('Correo o contraseña incorrectos.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Esta cuenta está desactivada. Contacta al consultorio.', 403);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new AppError('Correo o contraseña incorrectos.', 401);
  }

  const token = generateToken({ id: user.id, email: user.email, roleName: user.role.name });

  return { user: sanitizeUser(user), token };
}

/**
 * Cierra sesión: guarda el token actual en la blacklist con su
 * fecha real de expiración (tomada del propio JWT), para poder
 * limpiar filas vencidas más adelante sin riesgo.
 */
async function logout(token) {
  const decoded = verifyToken(token); // ya fue validado por el middleware, pero relo leemos para el exp
  await prisma.blacklistedToken.create({
    data: {
      token,
      expiresAt: new Date(decoded.exp * 1000),
    },
  });
}

/**
 * Devuelve el perfil del usuario autenticado (sin password).
 */
async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user) throw new AppError('Usuario no encontrado.', 404);
  return sanitizeUser(user);
}

module.exports = { register, login, logout, getProfile };
