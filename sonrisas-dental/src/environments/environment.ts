/**
 * Configuración de entorno (desarrollo).
 * Cuando agreguemos build de producción, crearemos environment.production.ts
 * y lo conectaremos vía fileReplacements en angular.json.
 */
export const environment = {
  production: false,
  apiUrl: 'https://sonrisa-dental-api.onrender.com/api'
};
