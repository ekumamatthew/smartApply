import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { AuthService } from './auth.service';

type SignUpBody = {
  email: string;
  password: string;
  name: string;
};

type SignInBody = {
  email: string;
  password: string;
};

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up/email')
  async signUpEmail(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, password, name } = this.readSignUpBody(req);
      const auth = this.authService.getAuthInstance();

      const result: unknown = await auth.api.signUpEmail({
        body: { email, password, name },
      });

      res.json(result);
    } catch (error: unknown) {
      res.status(400).json({ error: this.getErrorMessage(error) });
    }
  }

  @Post('sign-in/email')
  async signInEmail(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, password } = this.readSignInBody(req);
      const auth = this.authService.getAuthInstance();

      const result: unknown = await auth.api.signInEmail({
        body: { email, password },
      });

      res.json(result);
    } catch (error: unknown) {
      res.status(400).json({ error: this.getErrorMessage(error) });
    }
  }

  @Get('session')
  async getSession(@Req() req: Request, @Res() res: Response) {
    try {
      const auth = this.authService.getAuthInstance();
      const session: unknown = await auth.api.getSession({
        headers: req.headers as HeadersInit,
      });

      res.json(session);
    } catch (error: unknown) {
      res.status(400).json({ error: this.getErrorMessage(error) });
    }
  }

  @Get('get-session')
  async getSessionAlt(@Req() req: Request, @Res() res: Response) {
    try {
      const auth = this.authService.getAuthInstance();
      const session: unknown = await auth.api.getSession({
        headers: req.headers as HeadersInit,
      });

      res.json(session);
    } catch (error: unknown) {
      res.status(400).json({ error: this.getErrorMessage(error) });
    }
  }

  private readSignUpBody(req: Request): SignUpBody {
    const body = req.body as unknown;
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Invalid request body');
    }

    const { email, password, name } = body as Record<string, unknown>;
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof name !== 'string'
    ) {
      throw new BadRequestException('email, password and name must be strings');
    }

    return { email, password, name };
  }

  private readSignInBody(req: Request): SignInBody {
    const body = req.body as unknown;
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Invalid request body');
    }

    const { email, password } = body as Record<string, unknown>;
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new BadRequestException('email and password must be strings');
    }

    return { email, password };
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'Request failed';
  }
}
