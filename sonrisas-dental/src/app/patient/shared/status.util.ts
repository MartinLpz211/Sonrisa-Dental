import { AppointmentStatus } from '../../interfaces/appointment.interface';

/** Texto amigable para cada estado de cita (el backend ya los manda en mayúsculas). */
export function statusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    CANCELADA: 'Cancelada',
    COMPLETADA: 'Finalizada',
    REAGENDADA: 'Reagendada',
  };
  return labels[status] ?? status;
}

/** Clase CSS (definida localmente en cada componente) asociada al estado, para el color de la tarjeta/badge. */
export function statusClass(status: AppointmentStatus): string {
  return `status--${status.toLowerCase()}`;
}

/** true si la cita todavía se puede reagendar o cancelar desde el panel del paciente. */
export function isAppointmentEditable(status: AppointmentStatus): boolean {
  return status === 'PENDIENTE' || status === 'CONFIRMADA' || status === 'REAGENDADA';
}
