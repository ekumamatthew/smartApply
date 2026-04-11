import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { type Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { BillingService } from './billing.service';

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
  };
};

@Controller('api/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('summary')
  async summary(@Req() req: AuthenticatedRequest) {
    const userId = this.getUserId(req);
    return this.billingService.getSummary(userId);
  }

  // NEW: frontend calls this while user adjusts credits/currency slider
  // e.g. GET /api/billing/rates?credits=2000&currency=NGN
  @Get('rates')
  async getRates(
    @Query('credits') creditsStr?: string,
    @Query('currency') currency?: string,
  ) {
    const credits = Number(creditsStr ?? 0);
    if (!Number.isFinite(credits) || credits <= 0) {
      throw new BadRequestException('credits must be a positive number');
    }

    const resolvedCurrency = (currency ?? 'USD').trim().toUpperCase();

    // credits / creditsPerUsd gives USD amount, convert to cents for service
    // creditsPerUsd = 100, so 2000 credits = $20 = 2000 cents
    const amountUsdCents = Math.round((credits / 100) * 100); // credits * 1 cent each

    return this.billingService.getRates(amountUsdCents, resolvedCurrency);
  }

  // UPDATED: now accepts credits + currency from body
  @Post('checkout')
  async createCheckout(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      amountUsd?: number;
      amountUsdCents?: number;
      credits?: number; // NEW — e.g. 2000
      currency?: string; // NEW — e.g. 'NGN', 'KES', 'GHS', 'USD'
    },
  ) {
    const userId = this.getUserId(req);
    const amountUsdCents = this.resolveAmountUsdCents(body);
    const currency = body.currency?.trim().toUpperCase();

    return this.billingService.createCheckoutSession({
      userId,
      amountUsdCents,
      currency,
    });
  }

  @Post('checkout/confirm')
  async confirmCheckout(
    @Req() req: AuthenticatedRequest,
    @Body() body: { orderId?: string; transactionId?: string; txRef?: string },
  ) {
    const userId = this.getUserId(req);
    const orderId = body.orderId?.trim();
    const transactionId = body.transactionId?.trim();
    const txRef = body.txRef?.trim();

    if (!orderId || !transactionId) {
      throw new BadRequestException('orderId and transactionId are required');
    }

    return this.billingService.confirmCheckoutPayment({
      userId,
      orderId,
      transactionId,
      txRef,
    });
  }

  // FIXED: rawBody now passed through for HMAC signature verification
  @Public()
  @Post('webhook/flutterwave')
  async flutterwaveWebhook(@Req() req: Request, @Body() body: unknown) {
    const signature = req.header('verif-hash') || undefined;
    const rawBody = (req as Request & { rawBody?: string }).rawBody;

    const result = await this.billingService.handleFlutterwaveWebhook({
      signature,
      rawBody,
      payload: body,
    });
    return result;
  }

  private getUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Missing authenticated user id');
    }
    return userId;
  }

  private resolveAmountUsdCents(body: {
    amountUsd?: number;
    amountUsdCents?: number;
    credits?: number;
  }) {
    // credits takes priority — 2000 credits = $20 = 2000 cents (at 100 credits/USD)
    if (Number.isFinite(body.credits) && Number(body.credits) > 0) {
      return Math.round(Number(body.credits)); // 1 credit = 1 cent = $0.01
    }
    if (Number.isFinite(body.amountUsdCents)) {
      return Math.floor(Number(body.amountUsdCents));
    }
    if (Number.isFinite(body.amountUsd)) {
      return Math.floor(Number(body.amountUsd) * 100);
    }
    throw new BadRequestException(
      'Provide credits, amountUsd, or amountUsdCents. Minimum purchase is $1.00',
    );
  }
}
