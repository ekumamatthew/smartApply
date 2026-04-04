import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetricsController } from './common/controllers/metrics.controller';
import { AuthGuard } from './common/guards/auth.guard';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { MetricsService } from './common/services/metrics.service';
import { CvController } from './cv/cv.controller';
import { CvOptimizationService } from './cv/cv-optimization.service';
import { BillingController } from './billing/billing.controller';
import { BillingService } from './billing/billing.service';
import { EmailController } from './email/email.controller';
import { EmailQuotaService } from './email/email-quota.service';
import { EmailService } from './email/email.service';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';

@Module({
  controllers: [
    AppController,
    EmailController,
    CvController,
    BillingController,
    MetricsController,
    SettingsController,
  ],
  providers: [
    AppService,
    EmailService,
    BillingService,
    EmailQuotaService,
    CvOptimizationService,
    MetricsService,
    SettingsService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
  ],
})
export class AppModule {}
