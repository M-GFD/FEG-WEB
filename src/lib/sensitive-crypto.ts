import crypto from "crypto";

/**
 * Cifrado de datos sensibles del jugador (correo, DNI, teléfono).
 *
 * Algoritmo: AES-256-GCM (autenticado), con IV aleatorio por dato.
 * Formato persistido: "gcm:v1:<iv_b64>:<authTag_b64>:<ct_b64>".
 *
 * La clave NO se versiona: viene de la variable de entorno
 *   PLAYER_DATA_ENCRYPTION_KEY
 * que debe contener 32 bytes en hex (64 caracteres) o base64.
 */

const ALGO = "aes-256-gcm";
const IV_BYTES = 12;
const PREFIX = "gcm:v1:";

function loadKey(): Buffer {
  const raw = (process.env.PLAYER_DATA_ENCRYPTION_KEY ?? "").trim();
  if (!raw) {
    throw new Error(
      "PLAYER_DATA_ENCRYPTION_KEY no está configurada. Generá 32 bytes y guardalos en .env (hex o base64).",
    );
  }

  let key: Buffer | null = null;
  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length === 64) {
    key = Buffer.from(raw, "hex");
  } else {
    try {
      key = Buffer.from(raw, "base64");
    } catch {
      key = null;
    }
  }

  if (!key || key.length !== 32) {
    throw new Error(
      "PLAYER_DATA_ENCRYPTION_KEY inválida: se esperaban 32 bytes (64 hex o 44 base64).",
    );
  }
  return key;
}

export function encryptSensitive(plain: string | null | undefined): string | null {
  if (plain == null) return null;
  const value = String(plain).trim();
  if (!value) return null;

  const key = loadKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return (
    PREFIX +
    iv.toString("base64") +
    ":" +
    tag.toString("base64") +
    ":" +
    ct.toString("base64")
  );
}

export function decryptSensitive(payload: string | null | undefined): string | null {
  if (!payload) return null;
  if (!payload.startsWith(PREFIX)) {
    throw new Error("Formato de cifrado desconocido");
  }
  const [ivB64, tagB64, ctB64] = payload.slice(PREFIX.length).split(":");
  if (!ivB64 || !tagB64 || !ctB64) {
    throw new Error("Cifrado mal formado");
  }
  const key = loadKey();
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ct = Buffer.from(ctB64, "base64");

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}
