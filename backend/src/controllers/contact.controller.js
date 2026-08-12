const catchAsync = require('../utils/catchAsync');
const contactService = require('../services/contact.service');

/**
 * POST /api/contact
 * Público (sin autenticación): recibe el formulario de Contacto de la landing.
 */
exports.create = catchAsync(async (req, res) => {
  const { name, email, message } = req.body;

  const contactMessage = await contactService.createContactMessage({ name, email, message });

  res.status(201).json({
    success: true,
    data: { contactMessage },
    message: 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.',
  });
});

/**
 * GET /api/contact
 * Protegido (ADMIN): lista los mensajes recibidos.
 */
exports.getAll = catchAsync(async (req, res) => {
  const messages = await contactService.getAllContactMessages();
  res.json({ success: true, data: { messages } });
});
