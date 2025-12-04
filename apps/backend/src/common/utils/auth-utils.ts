import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from 'src/config/config.service';

const SALT_ROUNDS = 10;

/**
 * Hash a plain password using bcrypt
 * @param password string
 * @returns Promise<string>
 * @throws {Error} If password is empty or hashing fails
 */
export const hashPassword = async (password: string): Promise<string> => {
  if (!password || password.trim() === '') {
    throw new Error('Password cannot be empty');
  }

  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare provided password with hashed password
 * @param password string
 * @param hash string
 * @returns Promise<boolean> Returns true if passwords match, false otherwise
 * @throws {Error} If input validation fails
 */
export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  // Validate input - throw errors instead of returning false
  if (!password) {
    throw new Error('Password is required for verification');
  }

  if (!hash) {
    throw new Error('Hash is required for verification');
  }

  return await bcrypt.compare(password, hash);
};

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Generate JWT for authenticated user
 * @param user must contain id and email
 * @param config Nest ConfigService
 * @returns signed JWT string
 */
export const generateJwt = (
  user: { id: string; email: string },
  config: ConfigService,
): string => {
  const secret = config.get('JWT_SECRET');
  const expiresIn = config.get('JWT_EXPIRES_IN') ?? '1d';

  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign({ sub: user.id, email: user.email }, secret, {
    expiresIn,
    algorithm: 'HS256',
  } as jwt.SignOptions);
};

/**
 * Verify JWT, returns payload or throws
 * @param token string
 * @param config Nest ConfigService
 */
export const verifyJwt = (token: string, config: ConfigService): JwtPayload => {
  const secret = config.get('JWT_SECRET');
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    throw new Error('Invalid or expired token');
  }
};
