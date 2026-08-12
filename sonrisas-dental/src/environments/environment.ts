/**
 * Configuración de entorno (desarrollo).
 * Cuando agreguemos build de producción, crearemos environment.production.ts
 * y lo conectaremos vía fileReplacements en angular.json.
 */
export const environment = {
  production: false,

  apiUrl: 'http://localhost:3000/api',
  // apiUrl: 'https://sonrisa-dental-api.onrender.com/api',

  /** Dominio público del sitio, usado para <link rel="canonical"> y Open Graph. */
  siteUrl: 'https://www.sonrisasdental.mx',

  /** ID de Google Analytics 4 (Measurement ID, formato "G-XXXXXXXXXX"). */
  googleAnalyticsId: 'G-8NQZ00TD92',

  siteInfo: {
    phone: '(442) 130-0183',
    phoneHref: 'tel:4421300183',
    email: 'contacto@gmail.com',

    address:
      'Av. Pie de la Cuesta 2501, Nacional, 76148 Santiago de Querétaro, Qro.',

    openingHours: 'Lun–Sáb: 9am – 7pm',

    mapsQuery:
      'Av. Pie de la Cuesta 2501, Nacional, 76148 Santiago de Querétaro, Qro.',
  },
};