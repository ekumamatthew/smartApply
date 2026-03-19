import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { type Request, type Response } from 'express';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up/email')
  async signUpEmail(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, password, name } = req.body;
      const auth = this.authService.getAuthInstance();

      const result = await auth.api.signUpEmail({
        body: { email, password, name },
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  @Post('sign-in/email')
  async signInEmail(@Req() req: Request, @Res() res: Response) {
    try {
      console.log('Sign-in request body:', req.body);
      const { email, password } = req.body;
      const auth = this.authService.getAuthInstance();

      console.log('Attempting sign in with:', { email, password: '***' });
      const result = await auth.api.signInEmail({
        body: { email, password },
      });

      console.log('Sign-in result:', result);
      res.json(result);
    } catch (error) {
      console.error('Sign-in error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  @Get('session')
  async getSession(@Req() req: Request, @Res() res: Response) {
    try {
      const auth = this.authService.getAuthInstance();
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });

      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  @Get('get-session')
  async getSessionAlt(@Req() req: Request, @Res() res: Response) {
    try {
      const auth = this.authService.getAuthInstance();
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });

      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
