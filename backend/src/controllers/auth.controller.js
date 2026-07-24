const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');

exports.register = catchAsync(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ success: true, data: { user, token } });
});

exports.login = catchAsync(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({ success: true, data: { user, token } });
});

exports.logout = catchAsync(async (req, res) => {
  await authService.logout(req.token);
  res.json({ success: true, message: 'Sesión cerrada correctamente.' });
});

exports.me = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json({ success: true, data: { user } });
});
