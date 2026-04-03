import { BadRequestException, Body, Controller, Get, Post, Req } from '@nestjs/common';
import { type Request } from 'express';
import { BillingService } from './billing.service';
import { Public } from '../common/decorators/public.decorator';

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

  @Post('checkout')
  async createCheckout(
    @Req() req: AuthenticatedRequest,
    @Body() body: { amountUsd?: number; amountUsdCents?: number },
  ) {
    const userId = this.getUserId(req);
    const amountUsdCents = this.resolveAmountUsdCents(body);
    return this.billingService.createCheckoutSession({ userId, amountUsdCents });
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
      throw new BadRequestException(
        'orderId and transactionId are required',
      );
    }

    return this.billingService.confirmCheckoutPayment({
      userId,
      orderId,
      transactionId,
      txRef,
    });
  }

  @Public()
  @Post('webhook/flutterwave')
  async flutterwaveWebhook(
    @Req() req: Request,
    @Body() body: unknown,
  ) {
    const signature = req.header('verif-hash') || undefined;
    const result = await this.billingService.handleFlutterwaveWebhook({
      signature,
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

  private resolveAmountUsdCents(body: { amountUsd?: number; amountUsdCents?: number }) {
    if (Number.isFinite(body.amountUsdCents)) {
      return Math.floor(Number(body.amountUsdCents));
    }
    if (Number.isFinite(body.amountUsd)) {
      return Math.floor(Number(body.amountUsd) * 100);
    }
    throw new BadRequestException(
      'Provide amountUsd or amountUsdCents. Minimum purchase is $1.00',
    );
  }
}
