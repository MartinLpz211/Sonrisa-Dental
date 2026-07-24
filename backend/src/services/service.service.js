const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Igual que en patient.service.js: agregamos el conteo de citas
 * asociadas como dato útil para la tabla del admin (qué tan
 * solicitado es cada servicio), aprovechando la relación que ya
 * existe en el schema.
 */
const SERVICE_SELECT = {
  id: true,
  name: true,
  description: true,
  price: true,
  duration: true,
  imageUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { appointments: true } },
};

function formatService(service) {
  if (!service) return null;
  const { _count, ...rest } = service;
  return { ...rest, totalAppointments: _count?.appointments ?? 0 };
}

/**
 * Lista servicios con búsqueda opcional por nombre, filtro por
 * estado activo/inactivo, y paginación.
 */
async function getAllServices({ search, isActive, page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(limit) || DEFAULT_PAGE_SIZE));

  const where = {
    ...(isActive !== undefined ? { isActive } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
  };

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      select: SERVICE_SELECT,
      orderBy: { name: 'asc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    prisma.service.count({ where }),
  ]);

  return {
    services: services.map(formatService),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
}

async function getServiceById(id) {
  const service = await prisma.service.findUnique({
    where: { id: Number(id) },
    select: SERVICE_SELECT,
  });
  if (!service) {
    throw new AppError('Servicio no encontrado.', 404);
  }
  return formatService(service);
}

/**
 * Crea un servicio nuevo. Siempre nace activo (`isActive: true` es
 * el default del schema), consistente con "Crear nuevos servicios"
 * del requerimiento.
 */
async function createService({ name, description, price, duration, imageUrl }) {
  const service = await prisma.service.create({
    data: { name, description, price, duration, imageUrl: imageUrl || null },
    select: SERVICE_SELECT,
  });
  return formatService(service);
}

/**
 * Edita datos del servicio. No permite tocar `isActive` aquí a
 * propósito: activar/desactivar tiene sus propios endpoints
 * explícitos, igual que en el módulo de pacientes.
 */
async function updateService(id, { name, description, price, duration, imageUrl }) {
  await getServiceById(id); // valida existencia (404 si no)

  const data = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = price;
  if (duration !== undefined) data.duration = duration;
  if (imageUrl !== undefined) data.imageUrl = imageUrl || null;

  const updated = await prisma.service.update({
    where: { id: Number(id) },
    data,
    select: SERVICE_SELECT,
  });
  return formatService(updated);
}

/**
 * Borrado lógico: nunca `prisma.service.delete`. Cubre tanto
 * "Activarlos o desactivarlos" como "Eliminarlos de forma lógica"
 * del requerimiento — son la misma operación sobre `isActive`.
 */
async function setServiceActive(id, isActive) {
  await getServiceById(id);

  const updated = await prisma.service.update({
    where: { id: Number(id) },
    data: { isActive },
    select: SERVICE_SELECT,
  });
  return formatService(updated);
}

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deactivateService: (id) => setServiceActive(id, false),
  reactivateService: (id) => setServiceActive(id, true),
};
