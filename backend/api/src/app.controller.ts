import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { CurrentSession } from './common/decorators/current-session.decorator';
import { CurrentUser } from './common/decorators/current-user.decorator';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('me')
  getMe(@CurrentUser() user: unknown, @CurrentSession() session: unknown) {
    return { user, session };
  }
}
