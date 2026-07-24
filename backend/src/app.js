const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const patientRoutes = require('./routes/patient.routes');
const serviceRoutes = require('./routes/service.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const reportRoutes = require('./routes/report.routes');
const userRoutes = require('./routes/user.routes');
const settingsRoutes = require('./routes/settings.routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// --- Middlewares globales ---
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// --- Rutas ---
// Cada módulo nuevo (auth, users, services, appointments) agregará
// una línea aquí: app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

// --- 404 y manejo de errores (siempre al final) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
