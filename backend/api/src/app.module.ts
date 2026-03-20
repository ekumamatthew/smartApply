import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './common/guards/auth.guard';
import { CvController } from './cv/cv.controller';
import { EmailController } from './email/email.controller';
import { EmailService } from './email/email.service';

@Module({
  controllers: [AppController, EmailController, CvController],
  providers: [
    AppService,
    EmailService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
