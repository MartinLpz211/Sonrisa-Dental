const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getSettings = async (req, res) => {
  try {
    let settings = await prisma.clinicSettings.findFirst();
    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.clinicSettings.create({
        data: {
          name: 'Sonrisas Dental',
          phone: '',
          address: '',
          openingHours: 'Lunes a Viernes 09:00 - 18:00'
        }
      });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener ajustes' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { name, phone, address, openingHours } = req.body;

    let settings = await prisma.clinicSettings.findFirst();
    
    if (settings) {
      settings = await prisma.clinicSettings.update({
        where: { id: settings.id },
        data: { name, phone, address, openingHours }
      });
    } else {
      settings = await prisma.clinicSettings.create({
        data: { name, phone, address, openingHours }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar ajustes' });
  }
};
