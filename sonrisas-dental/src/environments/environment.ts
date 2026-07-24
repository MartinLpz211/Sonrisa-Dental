/**
 * Configuración de entorno (desarrollo).
 * Cuando agreguemos build de producción, crearemos environment.production.ts
 * y lo conectaremos vía fileReplacements en angular.json.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
