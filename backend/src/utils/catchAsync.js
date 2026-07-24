/**
 * Envuelve un controller async para capturar cualquier error
 * (incluyendo rechazos de promesas de Prisma) y pasarlo a next(),
 * donde el errorHandler centralizado se encarga de responder.
 *
 * Uso:
 *   router.get('/algo', catchAsync(async (req, res) => { ... }));
 *
 * Sin esto, tendríamos que repetir try/catch en cada controller.
 */
module.exports = function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
