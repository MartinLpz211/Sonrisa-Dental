const crypto = require('crypto');

/**
 * Cifrado híbrido de payload (capa ADICIONAL sobre HTTPS/TLS).
 *
 * Patrón: ECDH efímero por request (estilo ECIES) + HKDF-SHA256 + AES-256-GCM.
 *
 *   1. El cliente (Angular) genera un par de claves ECDH P-256 EFÍMERO
 *      por cada petición y lo descarta después de usarlo.
 *   2. El servidor mantiene un par de claves ECDH P-256 ESTÁTICO (por
 *      proceso, con rotación periódica — ver `rotateIfNeeded`).
 *   3. Ambos derivan el mismo secreto compartido vía ECDH y lo pasan
 *      por HKDF-SHA256 para obtener una clave AES-256 de uso único
 *      para ese request/response.
 *   4. AES-256-GCM cifra el contenido y produce el authTag, dando
 *      confidencialidad + integridad en un solo paso (a diferencia del
 *      AES-CBC sin autenticar del proyecto "cifrado-hibrido" original).
 *
 * La clave privada del servidor NUNCA sale de este módulo: no se
 * expone en ningún endpoint, no se persiste en BD ni en el código
 * fuente. Solo la clave pública (y el `keyId` vigente) se publican.
 */

const CURVE = 'P-256';
const HKDF_INFO = Buffer.from('sonrisas-dental-hybrid-v1');
const HKDF_HASH = 'sha256';
const AES_ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // recomendado por NIST para GCM
const KEY_LENGTH = 32; // AES-256

// Cuánto tiempo vive cada clave del servidor antes de rotar, y cuántas
// generaciones anteriores se mantienen vivas para no romper requests
// que ya obtuvieron la clave pública justo antes de una rotación.
const ROTATION_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24h
const MAX_RETAINED_KEYS = 2; // actual + 1 anterior

// Ventana de tolerancia para el timestamp anti-replay embebido en el
// payload descifrado (ver `decryptEnvelope`). Se aplica solo si el
// payload trae el campo `ts` (lo agregaremos desde Angular en FASE 4).
const REPLAY_WINDOW_MS = 60 * 1000; // 60s

/** Map<keyId, { keyPair, createdAt }> — la más reciente es la "activa". */
const serverKeys = new Map();
let activeKeyId = null;
let rotationTimer = null;

function generateKeyId() {
  return crypto.randomBytes(8).toString('hex');
}

function generateServerKeyPair() {
  const keyId = generateKeyId();
  const keyPair = crypto.generateKeyPairSync('ec', { namedCurve: CURVE });
  serverKeys.set(keyId, { keyPair, createdAt: Date.now() });
  activeKeyId = keyId;

  // Purga generaciones viejas más allá de las que queremos retener,
  // para no acumular memoria indefinidamente.
  const ids = [...serverKeys.keys()];
  if (ids.length > MAX_RETAINED_KEYS) {
    const idsToDelete = ids
      .map((id) => ({ id, createdAt: serverKeys.get(id).createdAt }))
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, ids.length - MAX_RETAINED_KEYS)
      .map((x) => x.id);
    idsToDelete.forEach((id) => serverKeys.delete(id));
  }

  return keyId;
}

/**
 * Inicializa el par de claves del servidor al arrancar el proceso y
 * programa la rotación periódica. Se llama una sola vez desde
 * server.js, igual que `initServerKeys()` en el proyecto original.
 */
function initHybridCryptoKeys() {
  const keyId = generateServerKeyPair();
  console.log(`[HYBRID-CRYPTO] Par de claves ECDH P-256 del servidor listo (keyId=${keyId}).`);

  if (rotationTimer) clearInterval(rotationTimer);
  rotationTimer = setInterval(() => {
    const newKeyId = generateServerKeyPair();
    console.log(`[HYBRID-CRYPTO] Rotación de claves ejecutada (nuevo keyId=${newKeyId}).`);
  }, ROTATION_INTERVAL_MS);
  // No debe mantener el proceso vivo solo por este timer (útil en tests).
  if (rotationTimer.unref) rotationTimer.unref();
}

/**
 * Info pública para el endpoint GET /api/crypto/public-key.
 * Devuelve el punto EC crudo sin comprimir (0x04 || X || Y) en
 * base64, formato que Angular puede importar directamente con
 * `crypto.subtle.importKey('raw', ...)`.
 */
function getActivePublicKeyInfo() {
  if (!activeKeyId) {
    throw new Error('Las claves del servidor no se han inicializado (llama a initHybridCryptoKeys()).');
  }
  const entry = serverKeys.get(activeKeyId);
  const jwk = entry.keyPair.publicKey.export({ format: 'jwk' });
  return {
    keyId: activeKeyId,
    curve: CURVE,
    publicKey: jwkToRawPointBase64(jwk),
  };
}

function getServerKeyPairById(keyId) {
  const entry = serverKeys.get(keyId);
  if (!entry) return null;
  return entry.keyPair;
}

// ── Conversión entre punto EC crudo (formato Web Crypto 'raw') y JWK ──
// Node no acepta puntos EC crudos directamente; los envolvemos como
// JWK, que Node sí soporta de forma nativa y sin construir DER a mano.

function jwkToRawPointBase64(jwk) {
  const x = Buffer.from(jwk.x, 'base64url');
  const y = Buffer.from(jwk.y, 'base64url');
  return Buffer.concat([Buffer.from([0x04]), x, y]).toString('base64');
}

function rawPointBase64ToPublicKey(rawBase64) {
  const raw = Buffer.from(rawBase64, 'base64');
  if (raw.length !== 65 || raw[0] !== 0x04) {
    throw new Error('Formato de clave pública EC inválido (se esperaba punto sin comprimir de 65 bytes).');
  }
  const x = raw.slice(1, 33).toString('base64url');
  const y = raw.slice(33, 65).toString('base64url');
  return crypto.createPublicKey({ key: { kty: 'EC', crv: 'P-256', x, y }, format: 'jwk' });
}

/**
 * Deriva la clave AES-256 de sesión para un request/response dado,
 * a partir de la clave pública efímera del cliente y la clave
 * privada del servidor identificada por `keyId`.
 */
function deriveSessionKey(clientPublicKeyRawBase64, keyId) {
  const serverKeyPair = getServerKeyPairById(keyId);
  if (!serverKeyPair) {
    throw new Error('keyId desconocido o expirado. Solicita una clave pública nueva.');
  }
  const clientPublicKey = rawPointBase64ToPublicKey(clientPublicKeyRawBase64);
  const sharedSecret = crypto.diffieHellman({
    privateKey: serverKeyPair.privateKey,
    publicKey: clientPublicKey,
  });
  const derived = crypto.hkdfSync(HKDF_HASH, sharedSecret, Buffer.alloc(0), HKDF_INFO, KEY_LENGTH);
  return Buffer.from(derived);
}

/**
 * Descifra un envelope recibido del cliente.
 *
 * envelope: { version, keyId, encryptedKey, iv, authTag, ciphertext }
 *   - encryptedKey: clave pública ECDH efímera del CLIENTE (raw, base64).
 *     (se mantiene ese nombre de campo por continuidad con el diseño
 *     acordado, aunque aquí no es "una clave cifrada con RSA" sino la
 *     clave pública que el servidor necesita para el ECDH).
 *
 * Devuelve { plaintext, sessionKey } — `sessionKey` se usa después
 * para cifrar la respuesta correspondiente a este mismo request.
 */
function decryptEnvelope(envelope) {
  const { version, keyId, encryptedKey, iv, authTag, ciphertext } = envelope;

  if (version !== '1') {
    throw new Error(`Versión de payload cifrado no soportada: ${version}`);
  }
  if (!keyId || !encryptedKey || !iv || !authTag || !ciphertext) {
    throw new Error('Estructura de payload cifrado incompleta.');
  }

  const sessionKey = deriveSessionKey(encryptedKey, keyId);

  const decipher = crypto.createDecipheriv(AES_ALGO, sessionKey, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  let plaintextBuf;
  try {
    plaintextBuf = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64')),
      decipher.final(),
    ]);
  } catch {
    // setAuthTag + final() lanza si el ciphertext o el authTag fueron
    // alterados: esto es lo que detecta manipulación (tampering).
    throw new Error('El payload cifrado no pudo verificarse (posible manipulación).');
  }

  const parsed = JSON.parse(plaintextBuf.toString('utf8'));

  // Anti-replay: si el payload incluye `ts` (lo agrega Angular en
  // FASE 4), se valida que esté dentro de la ventana de tolerancia.
  // Si no lo incluye todavía, no se bloquea (compatibilidad hacia
  // atrás mientras se completa la integración del frontend).
  if (typeof parsed.ts === 'number') {
    const skewMs = Math.abs(Date.now() - parsed.ts);
    if (skewMs > REPLAY_WINDOW_MS) {
      throw new Error('El payload cifrado expiró (posible replay).');
    }
  }

  return { plaintext: parsed.payload !== undefined ? parsed.payload : parsed, sessionKey };
}

/**
 * Cifra la respuesta usando la MISMA clave de sesión derivada al
 * descifrar el request correspondiente (mismo canal ECDH, IV nuevo).
 * No requiere que el servidor conozca una clave pública nueva del
 * cliente: la clave de sesión ya fue acordada para este ciclo.
 */
function encryptEnvelope(dataObj, sessionKey) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(AES_ALGO, sessionKey, iv);
  const plaintext = Buffer.from(JSON.stringify(dataObj), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    version: '1',
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
}

/** Detecta si un objeto tiene la forma de un envelope cifrado válido. */
function isEncryptedEnvelope(body) {
  return (
    !!body &&
    typeof body === 'object' &&
    typeof body.version === 'string' &&
    typeof body.encryptedKey === 'string' &&
    typeof body.iv === 'string' &&
    typeof body.authTag === 'string' &&
    typeof body.ciphertext === 'string'
  );
}

module.exports = {
  initHybridCryptoKeys,
  getActivePublicKeyInfo,
  decryptEnvelope,
  encryptEnvelope,
  isEncryptedEnvelope,
};
