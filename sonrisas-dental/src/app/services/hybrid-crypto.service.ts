import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

/** Info pública de la clave del servidor, tal como la devuelve GET /api/crypto/public-key */
interface ServerPublicKeyInfo {
  keyId: string;
  curve: string;
  publicKey: string; // punto EC crudo sin comprimir (0x04 + X + Y), base64
}

/** Envelope que se envía al backend (misma forma acordada en FASE 2/3) */
export interface EncryptedEnvelope {
  version: string;
  keyId: string;
  encryptedKey: string; // clave pública ECDH efímera del cliente, raw, base64
  iv: string;
  authTag: string;
  ciphertext: string;
}

/** Envelope de respuesta del backend: no incluye keyId/encryptedKey (reutiliza el canal ya acordado) */
export interface EncryptedResponseEnvelope {
  version: string;
  iv: string;
  authTag: string;
  ciphertext: string;
}

const HKDF_INFO = new TextEncoder().encode('sonrisas-dental-hybrid-v1');
const AES_KEY_LENGTH = 256;
const GCM_TAG_LENGTH_BYTES = 16;

// Cuánto tiempo se reutiliza la clave pública del servidor en caché
// antes de volver a pedirla. El backend rota cada 24h y conserva la
// generación anterior, así que un margen amplio es seguro.
const PUBLIC_KEY_CACHE_TTL_MS = 60 * 60 * 1000; // 1h

/**
 * Cifrado híbrido a nivel de aplicación para Angular — contraparte de
 * `backend/src/config/hybridCrypto.js`.
 *
 * Por cada petición:
 *   1. Genera un par de claves ECDH P-256 EFÍMERO (se descarta después).
 *   2. Deriva un secreto compartido con la clave pública del servidor.
 *   3. HKDF-SHA256 sobre ese secreto → clave AES-256 de un solo uso.
 *   4. AES-256-GCM cifra el payload.
 *
 * La `CryptoKey` de sesión (AES) se devuelve junto al envelope para
 * que el interceptor pueda descifrar la respuesta correspondiente sin
 * tener que repetir el ECDH.
 */
@Injectable({ providedIn: 'root' })
export class HybridCryptoService {
  private readonly cryptoApiUrl = `${environment.apiUrl}/crypto`;

  private cachedServerKey: ServerPublicKeyInfo | null = null;
  private cachedAt = 0;

  constructor(private http: HttpClient) {}

  /** Obtiene la clave pública del servidor, usando caché en memoria. */
  private async getServerPublicKey(): Promise<ServerPublicKeyInfo> {
    const isStale = Date.now() - this.cachedAt > PUBLIC_KEY_CACHE_TTL_MS;
    if (!this.cachedServerKey || isStale) {
      const res = await firstValueFrom(
        this.http.get<{ success: boolean; data: ServerPublicKeyInfo }>(
          `${this.cryptoApiUrl}/public-key`
        )
      );
      this.cachedServerKey = res.data;
      this.cachedAt = Date.now();
    }
    return this.cachedServerKey;
  }

  /** Fuerza a pedir una clave nueva (usado si el backend rechaza un keyId vencido). */
  invalidateServerKeyCache(): void {
    this.cachedServerKey = null;
  }

  // ── Helpers de codificación ────────────────────────────────────────

  private toBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes));
  }

  private fromBase64(b64: string): Uint8Array {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  // ── Derivación de claves ────────────────────────────────────────────

  private async importServerPublicKey(rawBase64: string): Promise<CryptoKey> {
    const raw = this.fromBase64(rawBase64);
    return crypto.subtle.importKey(
      'raw',
      raw as BufferSource,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      []
    );
  }

  /**
   * Deriva la clave AES-256-GCM de sesión a partir de un par de claves
   * ECDH (propio) y la clave pública del otro lado, con HKDF-SHA256 —
   * exactamente el mismo esquema que `deriveSessionKey` en el backend.
   */
  private async deriveAesKey(
    privateKey: CryptoKey,
    peerPublicKey: CryptoKey
  ): Promise<CryptoKey> {
    const sharedBits = await crypto.subtle.deriveBits(
      { name: 'ECDH', public: peerPublicKey },
      privateKey,
      256
    );

    const hkdfBaseKey = await crypto.subtle.importKey(
      'raw',
      sharedBits,
      { name: 'HKDF' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(0),
        info: HKDF_INFO,
      },
      hkdfBaseKey,
      { name: 'AES-GCM', length: AES_KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // ── API pública del servicio ────────────────────────────────────────

  /**
   * Cifra un payload para enviarlo al backend.
   * Devuelve el envelope a mandar en el body Y la CryptoKey de sesión
   * (para descifrar la respuesta correspondiente).
   */
  async encryptRequest(
    payload: unknown
  ): Promise<{ envelope: EncryptedEnvelope; sessionKey: CryptoKey }> {
    const serverKeyInfo = await this.getServerPublicKey();
    const serverPublicKey = await this.importServerPublicKey(serverKeyInfo.publicKey);

    // Par de claves EFÍMERO: uno nuevo por cada request, se descarta
    // después de usarse (nunca se persiste ni se reutiliza).
    const clientKeyPair = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveBits']
    );

    const sessionKey = await this.deriveAesKey(clientKeyPair.privateKey, serverPublicKey);

    // Se envuelve con `ts` para que el backend pueda aplicar la
    // ventana anti-replay (ver REPLAY_WINDOW_MS en hybridCrypto.js).
    const plaintext = new TextEncoder().encode(
      JSON.stringify({ payload, ts: Date.now() })
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = new Uint8Array(
      await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sessionKey, plaintext)
    );

    // Web Crypto devuelve ciphertext+tag concatenados; el backend
    // (Node) los espera separados (`ciphertext` y `authTag`).
    const tagStart = encrypted.length - GCM_TAG_LENGTH_BYTES;
    const ciphertext = encrypted.slice(0, tagStart);
    const authTag = encrypted.slice(tagStart);

    const clientPublicKeyRaw = await crypto.subtle.exportKey('raw', clientKeyPair.publicKey);

    const envelope: EncryptedEnvelope = {
      version: '1',
      keyId: serverKeyInfo.keyId,
      encryptedKey: this.toBase64(clientPublicKeyRaw),
      iv: this.toBase64(iv),
      authTag: this.toBase64(authTag),
      ciphertext: this.toBase64(ciphertext),
    };

    return { envelope, sessionKey };
  }

  /**
   * Descifra una respuesta del backend usando la MISMA sessionKey que
   * se usó para cifrar el request de este mismo ciclo.
   */
  async decryptResponse<T>(
    envelope: EncryptedResponseEnvelope,
    sessionKey: CryptoKey
  ): Promise<T> {
    const iv = this.fromBase64(envelope.iv);
    const ciphertext = this.fromBase64(envelope.ciphertext);
    const authTag = this.fromBase64(envelope.authTag);

    // Web Crypto espera ciphertext+tag concatenados para descifrar.
    const combined = new Uint8Array(ciphertext.length + authTag.length);
    combined.set(ciphertext, 0);
    combined.set(authTag, ciphertext.length);

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, sessionKey, combined.buffer);
    const text = new TextDecoder().decode(decrypted);
    return JSON.parse(text) as T;
  }

  /** Detecta si un body de respuesta tiene forma de envelope cifrado. */
  isEncryptedResponseEnvelope(body: unknown): body is EncryptedResponseEnvelope {
    return (
      !!body &&
      typeof body === 'object' &&
      typeof (body as any).version === 'string' &&
      typeof (body as any).iv === 'string' &&
      typeof (body as any).authTag === 'string' &&
      typeof (body as any).ciphertext === 'string' &&
      !('encryptedKey' in (body as any)) // distingue de un envelope de REQUEST
    );
  }
}
