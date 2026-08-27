import crypto from 'crypto';

/**
 * Hashes a plain-text password using Node.js crypto.scryptSync with a unique random salt.
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

/**
 * Verifies a plain-text password against a stored scrypt hash and salt.
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const hashToVerify = crypto.scryptSync(password, salt, 64).toString('hex');
    const bufStored = Buffer.from(storedHash, 'hex');
    const bufVerify = Buffer.from(hashToVerify, 'hex');
    if (bufStored.length !== bufVerify.length) return false;
    return crypto.timingSafeEqual(bufStored, bufVerify);
  } catch (err) {
    console.error('[Auth Utils] Error verifying password hash:', err);
    return false;
  }
}

export interface UserTokenPayload {
  userId: string;
  role: 'customer' | 'cleaner' | 'admin';
  email: string;
  fullName: string;
  iat: number;
  exp: number;
}

const AUTH_SECRET = process.env.JWT_SECRET || 'dustbustars_secret_key_london_2026_x89a';

/**
 * Generates an authentication token for a logged-in user.
 */
export function generateToken(userId: string, role: 'customer' | 'cleaner' | 'admin', email: string, fullName: string): string {
  const payload: UserTokenPayload = {
    userId,
    role,
    email,
    fullName,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days valid
  };
  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(base64Payload).digest('base64url');
  return `${base64Payload}.${signature}`;
}

/**
 * Verifies an authentication token and returns its decoded payload.
 */
export function verifyToken(token: string): UserTokenPayload | null {
  if (!token || !token.includes('.')) return null;
  try {
    const [base64Payload, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(base64Payload).digest('base64url');
    if (signature !== expectedSignature) {
      console.warn('[Auth Utils] Invalid token signature detected.');
      return null;
    }
    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf8');
    const payload: UserTokenPayload = JSON.parse(jsonStr);
    if (Date.now() > payload.exp) {
      console.warn('[Auth Utils] Token has expired.');
      return null;
    }
    return payload;
  } catch (err) {
    console.error('[Auth Utils] Error verifying token:', err);
    return null;
  }
}
