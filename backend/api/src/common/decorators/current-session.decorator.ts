import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';

type AuthenticatedRequest = Request & {
  session?: unknown;
};

export const CurrentSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.session;
  },
);
