/**
 * Roles disponibles en el sistema.
 * Deben coincidir exactamente con el campo `name` de la tabla `roles`
 * en el backend (ver prisma/schema.prisma -> seed.js).
 */
export type RoleName = 'ADMIN' | 'PACIENTE';

export interface Role {
  id: number;
  name: RoleName;
}

/**
 * Forma del usuario tal como lo devuelve la API (sin password,
 * el backend ya lo elimina con sanitizeUser()).
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  isActive: boolean;
  roleId: number;
  role: Role;
  language?: string;
  notificationsEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}
