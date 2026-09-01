import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const COOKIE_NAME = 'acd_admin_session';
const SECRET_KEY = process.env.SESSION_SECRET || 'super-secret-acd-martial-arts-key-2026';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// Helper to convert string to ArrayBuffer for Web Crypto API
function stringToBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer as ArrayBuffer;
}

// Convert ArrayBuffer to Hex
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Import Secret Key for HMAC SHA-256
async function getCryptoKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    stringToBuffer(SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Sign a payload string: returns `payload.timestamp.signatureHex`
 */
export async function createSessionToken(username: string): Promise<string> {
  const timestamp = Date.now().toString();
  const payload = `${username}:${timestamp}`;
  const key = await getCryptoKey();
  const signature = await crypto.subtle.sign('HMAC', key, stringToBuffer(payload));
  const hex = bufferToHex(signature);
  return `${payload}:${hex}`;
}

/**
 * Verify session token string
 */
export async function verifySessionToken(token: string): Promise<{ valid: boolean; username?: string }> {
  if (!token) return { valid: false };

  const parts = token.split(':');
  if (parts.length !== 3) return { valid: false };

  const [username, timestampStr, signatureHex] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return { valid: false };

  // Check expiration (7 days)
  if (Date.now() - timestamp > MAX_AGE * 1000) {
    return { valid: false };
  }

  const payload = `${username}:${timestampStr}`;
  const key = await getCryptoKey();

  // Convert hex signature back to ArrayBuffer
  const match = signatureHex.match(/.{1,2}/g);
  if (!match) return { valid: false };
  const sigBuffer = new Uint8Array(match.map((byte) => parseInt(byte, 16))).buffer as ArrayBuffer;

  const isValid = await crypto.subtle.verify('HMAC', key, sigBuffer, stringToBuffer(payload));

  if (isValid) {
    return { valid: true, username };
  }
  return { valid: false };
}

/**
 * Server-side check for active session via next/headers cookies or NextRequest
 */
export async function checkAdminSession(req?: NextRequest): Promise<{ authenticated: boolean; username?: string }> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // Out of request context fallback
    }
  }

  if (!token) {
    return { authenticated: false };
  }

  const result = await verifySessionToken(token);
  return { authenticated: result.valid, username: result.username };
}

export { COOKIE_NAME, MAX_AGE };
