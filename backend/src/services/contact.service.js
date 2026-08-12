const prisma = require('../config/prisma');

/**
 * Guarda un mensaje enviado desde el formulario público de Contacto.
 * No requiere autenticación: cualquier visitante de la landing puede
 * usarlo.
 */
exports.createContactMessage = async ({ name, email, message }) => {
  return prisma.contactMessage.create({
    data: { name, email, message },
  });
};

/**
 * Lista los mensajes de contacto recibidos, más recientes primero.
 * Pensado para un futuro panel de administración; por ahora no tiene
 * ruta expuesta salvo lo necesario para revisarlos manualmente.
 */
exports.getAllContactMessages = async () => {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
};
