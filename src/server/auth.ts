import crypto from 'crypto';
import { db, UserAccount, Session } from './db';

// Safely hashes a password using PBKDF2
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Verifies a password hash
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  } catch (error) {
    return false;
  }
}

// Generates an cryptographically secure session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Creates an active session for registered user
export function createSession(userId: string): Session {
  const token = generateSessionToken();
  const session: Session = {
    token,
    userId,
    createdAt: new Date()
  };
  db.sessions.set(token, session);
  return session;
}

// Validates token and returns current user account
export function validateSession(token: string | undefined): UserAccount | null {
  if (!token) return null;
  const session = db.sessions.get(token);
  if (!session) return null;
  
  // Optional: check expiration (e.g. 7 days)
  const user = db.users.get(session.userId);
  return user || null;
}
