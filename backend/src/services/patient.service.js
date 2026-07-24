const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Select reutilizable: nunca traemos `password`, y agregamos el
 * conteo de citas como dato útil para la tabla del admin (cuántas
 * citas tiene cada paciente) sin necesitar todavía el módulo de citas.
 */
const PATIENT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  birthDate: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { appointmentsAsPatient: true } },
};

/**
 * Aplana `_count.appointmentsAsPatient` a `totalAppointments` para
 * que el frontend no tenga que conocer el nombre interno de la relación.
 */
function formatPatient(user) {
  if (!user) return null;
  const { _count, ...rest } = user;
  return { ...rest, totalAppointments: _count?.appointmentsAsPatient ?? 0 };
}

/**
 * Lista pacientes (rol PACIENTE) con búsqueda opcional por nombre,
 * apellido, correo o teléfono, filtro por estado activo/inactivo,
 * y paginación. Solo pacientes: un admin nunca debe aparecer aquí
 * ni ser editable/desactivable desde este módulo.
 */
async function getAllPatients({ search, isActive, page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(limit) || DEFAULT_PAGE_SIZE));

  const where = {
    role: { name: 'PACIENTE' },
    ...(isActive !== undefined ? { isActive } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [patients, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: PATIENT_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    patients: patients.map(formatPatient),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
}

/**
 * Busca un paciente por id. Se filtra también por rol PACIENTE para
 * que este endpoint no sirva como puerta trasera para ver/editar
 * cuentas de administrador.
 */
async function getPatientById(id) {
  const user = await prisma.user.findFirst({
    where: { id: Number(id), role: { name: 'PACIENTE' } },
    select: PATIENT_SELECT,
  });
  if (!user) {
    throw new AppError('Paciente no encontrado.', 404);
  }
  return formatPatient(user);
}

/**
 * Edita datos de contacto/perfil de un paciente. Deliberadamente NO
 * permite tocar aquí `password`, `roleId` ni `isActive`: cambiar la
 * contraseña es un flujo aparte (fuera de este módulo) y activar/
 * desactivar tiene sus propios endpoints explícitos más abajo, para
 * que quede claro en los logs/auditoría qué acción se realizó.
 */
async function updatePatient(id, { firstName, lastName, email, phone, birthDate }) {
  await getPatientById(id); // valida existencia y que sea PACIENTE (404 si no)

  const data = {};
  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (email !== undefined) data.email = email;
  if (phone !== undefined) data.phone = phone;
  if (birthDate !== undefined) data.birthDate = birthDate ? new Date(birthDate) : null;

  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data,
    select: PATIENT_SELECT,
  });
  return formatPatient(updated);
}

/**
 * Borrado lógico: nunca se usa `prisma.user.delete`. Si el paciente
 * ya está inactivo, no es un error — la operación es idempotente.
 */
async function setPatientActive(id, isActive) {
  await getPatientById(id);

  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: { isActive },
    select: PATIENT_SELECT,
  });
  return formatPatient(updated);
}

module.exports = {
  getAllPatients,
  getPatientById,
  updatePatient,
  deactivatePatient: (id) => setPatientActive(id, false),
  reactivatePatient: (id) => setPatientActive(id, true),
};
