/**
 * Horario laboral del consultorio, centralizado aquí para que
 * appointment.service.js no tenga números mágicos regados.
 * Días: 0=domingo ... 6=sábado (igual que Date.getDay()).
 */
module.exports = {
  OPEN_TIME: '09:00',
  CLOSE_TIME: '18:00',
  WORKING_DAYS: [1, 2, 3, 4, 5, 6], // lunes a sábado, cerrado domingo
  SLOT_INTERVAL_MINUTES: 30,
};