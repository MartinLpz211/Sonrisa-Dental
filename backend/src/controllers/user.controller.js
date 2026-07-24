const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, birthDate } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        birthDate: true,
        language: true,
        notificationsEnabled: true,
        role: { select: { name: true } }
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar perfil' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language, notificationsEnabled } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        language,
        notificationsEnabled,
      },
      select: {
        id: true,
        language: true,
        notificationsEnabled: true,
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar preferencias' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error interno del servidor al cambiar contraseña' });
  }
};
