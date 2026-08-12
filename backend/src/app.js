const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const cryptoRoutes = require('./routes/crypto.routes');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const patientRoutes = require('./routes/patient.routes');
const serviceRoutes = require('./routes/service.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const reportRoutes = require('./routes/report.routes');
const userRoutes = require('./routes/user.routes');
const settingsRoutes = require('./routes/settings.routes');
const contactRoutes = require('./routes/contact.routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// --- Middlewares globales ---

// Lista de orígenes permitidos explícitos
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:3000',
  env.corsOrigin // Lee la variable definida en tus variables de entorno
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // 1. Permitir peticiones sin origen (como herramientas Postman, curl o consultas server-to-server)
    if (!origin) return callback(null, true);

    // 2. Verificar si está en la lista explícita o si pertenece a Vercel (.vercel.app)
    const isAllowed = allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para el origen: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// --- Rutas ---
app.use('/api/health', healthRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);

// --- 404 y manejo de errores (siempre al final) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;