import { User } from './user.interface';

/** Payload que se envía a POST /api/auth/login */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Payload que se envía a POST /api/auth/register */
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string;
}

/** Forma genérica de las respuestas exitosas de la API */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Forma del error que devuelve errorHandler.js del backend.
 * Los errores de validación de express-validator llegan ya unidos
 * en un solo string (separados por " | "), no como arreglo.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface AuthData {
  user: User;
  token: string;
}
