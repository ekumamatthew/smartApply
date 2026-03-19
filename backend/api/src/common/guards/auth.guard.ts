import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Request } from 'express';
import { auth } from '../../lib/auth';
import { IS_PUBLIC_KEY } from '../constants/auth.constants';

type BetterAuthSession = {
  user?: unknown;
  session?: unknown;
};

type AuthenticatedRequest = Request & {
  user?: unknown;
  session?: unknown;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    try {
      const session = (await auth.api.getSession({
        headers: request.headers as HeadersInit,
      })) as BetterAuthSession | null;

      if (!session?.user) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      request.user = session.user;
      request.session = session.session;
      return true;
    } catch {
      throw new UnauthorizedException('Authentication required');
    }
  }
}
