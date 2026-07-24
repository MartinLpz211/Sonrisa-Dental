import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
    title: 'Sonrisas Dental',
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Iniciar sesión — Sonrisas Dental',
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'Crear cuenta — Sonrisas Dental',
  },
  {
    path: 'legal',
    loadComponent: () => import('./components/footer/legal/legal.component').then((m) => m.LegalComponent),
    title: 'Términos y Condiciones — Sonrisas Dental',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
        title: 'Dashboard — Sonrisas Dental',
      },
      {
        path: 'pacientes',
        loadComponent: () =>
          import('./admin/patients/patients.component').then((m) => m.PatientsComponent),
        title: 'Pacientes — Sonrisas Dental',
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./admin/services/services.component').then((m) => m.AdminServicesComponent),
        data: { title: 'Servicios Dentales' },
        title: 'Servicios — Sonrisas Dental',
      },
      {
        path: 'citas',
        loadComponent: () =>
          import('./admin/appointments/appointments.component').then((m) => m.AdminAppointmentsComponent),
        data: { title: 'Citas' },
        title: 'Citas — Sonrisas Dental',
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('./admin/calendar/calendar.component').then((m) => m.AdminCalendarComponent),
        data: { title: 'Calendario' },
        title: 'Calendario — Sonrisas Dental',
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./admin/reports/reports.component').then((m) => m.AdminReportsComponent),
        data: { title: 'Reportes' },
        title: 'Reportes — Sonrisas Dental',
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./admin/settings/admin-settings.component').then((m) => m.AdminSettingsComponent),
        data: { title: 'Configuración' },
        title: 'Configuración — Sonrisas Dental',
      },
    ],
  },
  {
    path: 'paciente',
    loadComponent: () =>
      import('./patient/patient-layout/patient-layout.component').then(
        (m) => m.PatientLayoutComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['PACIENTE'] },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./patient/patient-home/patient-home.component').then(
            (m) => m.PatientHomeComponent
          ),
        title: 'Mi Panel — Sonrisas Dental',
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./patient/patient-services/patient-services.component').then(
            (m) => m.PatientServicesComponent
          ),
        title: 'Agendar cita — Sonrisas Dental',
      },
      {
        path: 'citas',
        loadComponent: () =>
          import('./patient/patient-appointments/patient-appointments.component').then(
            (m) => m.PatientAppointmentsComponent
          ),
        title: 'Mis citas — Sonrisas Dental',
      },
      {
        path: 'citas/:id',
        loadComponent: () =>
          import(
            './patient/patient-appointment-detail/patient-appointment-detail.component'
          ).then((m) => m.PatientAppointmentDetailComponent),
        title: 'Detalle de cita — Sonrisas Dental',
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./patient/patient-profile/patient-profile.component').then(
            (m) => m.PatientProfileComponent
          ),
        title: 'Mi perfil — Sonrisas Dental',
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('./patient/patient-history/patient-history.component').then(
            (m) => m.PatientHistoryComponent
          ),
        title: 'Historial — Sonrisas Dental',
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./patient/patient-notifications/patient-notifications.component').then(
            (m) => m.PatientNotificationsComponent
          ),
        title: 'Notificaciones — Sonrisas Dental',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
