const prisma = require('../config/prisma');

/**
 * Cuántas citas próximas / pacientes recientes mostrar en el Dashboard.
 * Constantes en vez de números mágicos repetidos.
 */
const UPCOMING_APPOINTMENTS_LIMIT = 5;
const RECENT_PATIENTS_LIMIT = 5;
const TOP_SERVICES_LIMIT = 5;
const MONTHS_FOR_CHART = 6;

/**
 * Devuelve el rango [inicio, fin) del día de hoy en el huerto local
 * del servidor. Como Appointment.date solo representa el día del
 * turno (ver comentario en schema.prisma), comparamos por rango en
 * vez de por igualdad exacta de DateTime, que fallaría por la hora.
 */
function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

/**
 * Totales simples para las tarjetas superiores del Dashboard.
 * Se lanzan todas las queries en paralelo (Promise.all) porque son
 * independientes entre sí: no hay razón para esperarlas en serie.
 */
async function getTotals() {
  const { start, end } = getTodayRange();

  const [
    totalPatients,
    totalServices,
    totalAppointments,
    appointmentsToday,
    appointmentsPending,
    appointmentsCompleted,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { name: 'PACIENTE' } } }),
    prisma.service.count(),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { date: { gte: start, lt: end } } }),
    prisma.appointment.count({ where: { status: 'PENDIENTE' } }),
    prisma.appointment.count({ where: { status: 'COMPLETADA' } }),
  ]);

  return {
    totalPatients,
    totalServices,
    totalAppointments,
    appointmentsToday,
    appointmentsPending,
    appointmentsCompleted,
  };
}

/**
 * Top N servicios con más citas asociadas (de cualquier estado).
 * Prisma no permite ordenar directamente por una relación contada,
 * así que se agrupa por serviceId y luego se resuelven los nombres
 * en una segunda query.
 */
async function getTopServices(limit = TOP_SERVICES_LIMIT) {
  const grouped = await prisma.appointment.groupBy({
    by: ['serviceId'],
    _count: { serviceId: true },
    orderBy: { _count: { serviceId: 'desc' } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const services = await prisma.service.findMany({
    where: { id: { in: grouped.map((g) => g.serviceId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(services.map((s) => [s.id, s.name]));

  return grouped.map((g) => ({
    serviceId: g.serviceId,
    name: nameById.get(g.serviceId) ?? 'Servicio eliminado',
    appointmentsCount: g._count.serviceId,
  }));
}

/**
 * Próximas citas: desde hoy en adelante, sin contar canceladas ni
 * completadas (esas ya no son "próximas"), ordenadas por fecha y hora.
 */
async function getUpcomingAppointments(limit = UPCOMING_APPOINTMENTS_LIMIT) {
  const { start } = getTodayRange();

  return prisma.appointment.findMany({
    where: {
      date: { gte: start },
      status: { notIn: ['CANCELADA', 'COMPLETADA'] },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    take: limit,
    select: {
      id: true,
      date: true,
      startTime: true,
      status: true,
      patient: { select: { id: true, firstName: true, lastName: true } },
      service: { select: { id: true, name: true } },
    },
  });
}

/**
 * Últimos pacientes registrados (rol PACIENTE), sin exponer el
 * password: se usa `select` en vez de traer el registro completo
 * y limpiarlo después, así el hash nunca sale de la base de datos.
 */
async function getRecentPatients(limit = RECENT_PATIENTS_LIMIT) {
  return prisma.user.findMany({
    where: { role: { name: 'PACIENTE' } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
  });
}

/**
 * Serie de citas por mes para la gráfica (Chart.js en el frontend).
 * Se arma con SQL crudo porque Prisma no soporta agrupar por
 * "date_trunc('month', ...)" en su API de groupBy. Se cubren los
 * últimos MONTHS_FOR_CHART meses completos, rellenando con 0 los
 * meses sin citas para que la gráfica no tenga huecos.
 */
async function getAppointmentsByMonth(months = MONTHS_FOR_CHART) {
  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);
  since.setMonth(since.getMonth() - (months - 1));

  const rows = await prisma.$queryRaw`
    SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') AS month,
           COUNT(*)::int AS count
    FROM "appointments"
    WHERE "date" >= ${since}
    GROUP BY 1
    ORDER BY 1
  `;

  const countByMonth = new Map(rows.map((r) => [r.month, r.count]));

  // Rellenar meses sin citas para que el eje X de la gráfica sea continuo.
  const result = [];
  const cursor = new Date(since);
  for (let i = 0; i < months; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    result.push({ month: key, count: countByMonth.get(key) ?? 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
}

/**
 * Punto de entrada único: junta todo lo que necesita el Dashboard
 * del administrador en una sola respuesta, para que el frontend
 * haga una sola llamada HTTP al cargar la pantalla.
 */
async function getDashboardStats() {
  const [totals, topServices, upcomingAppointments, recentPatients, appointmentsByMonth] =
    await Promise.all([
      getTotals(),
      getTopServices(),
      getUpcomingAppointments(),
      getRecentPatients(),
      getAppointmentsByMonth(),
    ]);

  return { totals, topServices, upcomingAppointments, recentPatients, appointmentsByMonth };
}

module.exports = { getDashboardStats };
