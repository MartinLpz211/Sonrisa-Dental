const AppError = require('../utils/AppError');
const {
  decryptEnvelope,
  encryptEnvelope,
  isEncryptedEnvelope,
} = require('../config/hybridCrypto');

/**
 * decryptPayload
 * ---------------
 * Se coloca ANTES del controller en las rutas que definimos como
 * sensibles (login, register, etc — ver lista en FASE 2).
 *
 * Comportamiento retrocompatible a propósito: si `req.body` no tiene
 * la forma de un envelope cifrado (campos version/encryptedKey/iv/
 * authTag/ciphertext), se asume que es JSON plano y se deja pasar sin
 * tocarlo. Esto permite migrar el frontend endpoint por endpoint sin
 * romper nada mientras Angular todavía no cifra (FASE 4 pendiente).
 *
 * Si SÍ es un envelope cifrado:
 *   - Lo descifra y reemplaza `req.body` con el objeto original en
 *     claro, para que el controller lo use exactamente igual que hoy.
 *   - Guarda la clave de sesión derivada en `req.hybridSessionKey`,
 *     para que `encryptResponse` pueda cifrar la respuesta con la
 *     misma clave.
 *   - Si el descifrado falla (payload manipulado, keyId vencido,
 *     estructura inválida, replay), corta con 400 antes de llegar al
 *     controller.
 */
function decryptPayload(req, res, next) {
  if (!isEncryptedEnvelope(req.body)) {
    return next();
  }

  try {
    const { plaintext, sessionKey } = decryptEnvelope(req.body);
    req.body = plaintext;
    req.hybridSessionKey = sessionKey;
    next();
  } catch (err) {
    next(new AppError(`Payload cifrado inválido: ${err.message}`, 400));
  }
}

/**
 * encryptResponse
 * ----------------
 * Envuelve `res.json` para cifrar la respuesta SOLO cuando el request
 * de este mismo ciclo llegó cifrado (es decir, `req.hybridSessionKey`
 * fue establecido por `decryptPayload`). Si el request llegó en claro,
 * la respuesta también sale en claro, sin cambios — así ningún cliente
 * que todavía no implementa cifrado (Postman, curl, Angular pre-FASE4)
 * se rompe.
 *
 * El controller sigue llamando `res.json({...})` exactamente igual que
 * siempre; no necesita saber que existe cifrado.
 */
function encryptResponse(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (!req.hybridSessionKey) {
      return originalJson(body);
    }
    const envelope = encryptEnvelope(body, req.hybridSessionKey);
    return originalJson(envelope);
  };

  next();
}

module.exports = { decryptPayload, encryptResponse };
