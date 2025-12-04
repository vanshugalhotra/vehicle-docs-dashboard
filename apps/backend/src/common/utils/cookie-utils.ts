import { Response } from 'express';
import { ConfigService } from 'src/config/config.service';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  maxAge?: number;
}

export const getCookieOptions = (config: ConfigService): CookieOptions => {
  const secure = config.get('AUTH_COOKIE_SECURE');
  const sameSite = config.get('AUTH_COOKIE_SAMESITE').toLowerCase() as
    | 'strict'
    | 'lax'
    | 'none';
  const path = config.get('AUTH_COOKIE_PATH');

  // Parse JWT_EXPIRES_IN (supports: 7d, 12h, 30m)
  const expiresConfig = config.get('JWT_EXPIRES_IN');

  const maxAge = parseExpiresToMs(expiresConfig);

  return {
    httpOnly: true,
    secure,
    sameSite,
    path,
    ...(maxAge ? { maxAge } : {}),
  };
};

/**
 * Clear cookie by overwriting with past expiry
 */
export const clearAuthCookie = (res: Response, config: ConfigService) => {
  res.clearCookie(config.get('AUTH_COOKIE_NAME'), {
    httpOnly: true,
    secure: config.get('AUTH_COOKIE_SECURE'),
    sameSite: config.get('AUTH_COOKIE_SAMESITE').toLowerCase() as
      | 'strict'
      | 'lax'
      | 'none',
    path: config.get('AUTH_COOKIE_PATH'),
  });
};

/**
 * Convert "7d", "12h", "30m" → milliseconds
 */
const parseExpiresToMs = (val: string): number | undefined => {
  if (!val) return undefined;

  const num = parseInt(val, 10);
  if (isNaN(num)) return undefined;

  if (val.endsWith('d')) return num * 24 * 60 * 60 * 1000;
  if (val.endsWith('h')) return num * 60 * 60 * 1000;
  if (val.endsWith('m')) return num * 60 * 1000;
  if (val.endsWith('s')) return num * 1000;

  return undefined;
};
