/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

const getSessionMock = jest.fn();

jest.mock('../../lib/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => getSessionMock(...args),
    },
  },
}));

describe('AuthGuard', () => {
  const makeContext = (request: Record<string, unknown>) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as any;

  beforeEach(() => {
    getSessionMock.mockReset();
  });

  it('allows public routes', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as unknown as Reflector;
    const guard = new AuthGuard(reflector);

    await expect(guard.canActivate(makeContext({ headers: {} }))).resolves.toBe(
      true,
    );
    expect(getSessionMock).not.toHaveBeenCalled();
  });

  it('attaches session user for authenticated requests', async () => {
    getSessionMock.mockResolvedValue({
      user: { id: 'user_1' },
      session: { id: 'sess_1' },
    });

    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const guard = new AuthGuard(reflector);
    const req = { headers: {} } as Record<string, unknown>;

    await expect(guard.canActivate(makeContext(req))).resolves.toBe(true);
    expect((req as any).user).toEqual({ id: 'user_1' });
    expect((req as any).session).toEqual({ id: 'sess_1' });
  });

  it('throws UnauthorizedException when session is missing', async () => {
    getSessionMock.mockResolvedValue(null);

    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const guard = new AuthGuard(reflector);

    await expect(
      guard.canActivate(makeContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
