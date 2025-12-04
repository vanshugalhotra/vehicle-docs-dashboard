import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { Request } from 'express';
import { verifyJwt, JwtPayload } from 'src/common/utils/auth-utils';

// Extend Express Request to include user property
declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

@Injectable()
export class AdminSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const adminSecret = request.headers['x-admin-secret'] as string | undefined;
    const expectedSecret = this.config.get('AUTH_ADMIN_SECRET');

    if (!adminSecret || adminSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid admin secret');
    }
    return true;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const cookieName = this.config.get('AUTH_COOKIE_NAME');
    const cookies = request.cookies as Record<string, string> | undefined;
    const token = cookies?.[cookieName];

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload: JwtPayload = verifyJwt(token, this.config);
      request.user = payload;
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new UnauthorizedException(
          `Authentication failed: ${err.message}`,
        );
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
