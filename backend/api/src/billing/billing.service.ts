import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { dbPool } from '../lib/db';
import { sendTemplateEmail } from '../lib/transactional-email';

type UsageType = 'parse' | 'generate';

@Injectable()
export class BillingService {
  private readonly creditsPerUsd = Number(process.env.CREDITS_PER_USD ?? 100);
  private readonly minPurchaseUsdCents = Number(
    process.env.MIN_PURCHASE_USD_CENTS ?? 100,
  );
  private readonly parseCreditCost = Number(
    process.env.CREDIT_COST_PARSE ?? 25,
  );
  private readonly generateCreditCost = Number(
    process.env.CREDIT_COST_GENERATE ?? 40,
  );
  private readonly trialParseLimit = Number(
    process.env.AI_MAX_PARSE_PER_DAY ??
      process.env.AI_MAX_CV_GENERATE_PER_DAY ??
      4,
  );
  private readonly trialGenerateLimit = Number(
    process.env.AI_MAX_GENERATE_PER_DAY ??
      process.env.AI_MAX_EMAIL_GENERATE_PER_DAY ??
      4,
  );

  async getSummary(userId: string) {
    const [usage, balance] = await Promise.all([
      this.getUsageTotals(userId),
      this.getCreditBalance(userId),
    ]);

    return {
      trial: {
        parseUsed: usage.parseCvCount,
        parseLimit: this.trialParseLimit,
        parseRemaining: Math.max(0, this.trialParseLimit - usage.parseCvCount),
        generateUsed: usage.generateEmailCount,
        generateLimit: this.trialGenerateLimit,
        generateRemaining: Math.max(
          0,
          this.trialGenerateLimit - usage.generateEmailCount,
        ),
      },
      credits: {
        balance,
        creditsPerUsd: this.creditsPerUsd,
        minPurchaseUsdCents: this.minPurchaseUsdCents,
      },
      rates: {
        parse: this.parseCreditCost,
        generate: this.generateCreditCost,
      },
    };
  }

  async consumeCreditsForUsage(userId: string, usageType: UsageType) {
    const cost =
      usageType === 'parse' ? this.parseCreditCost : this.generateCreditCost;
    const reason =
      usageType === 'parse'
        ? 'CV optimization usage'
        : 'Email generation usage';

    return this.consumeCredits(userId, cost, reason, { usageType });
  }

  async createCheckoutSession(input: {
    userId: string;
    amountUsdCents: number;
  }) {
    const amountUsdCents = Math.floor(input.amountUsdCents);
    if (
      !Number.isFinite(amountUsdCents) ||
      amountUsdCents < this.minPurchaseUsdCents
    ) {
      throw new BadRequestException(
        `Minimum purchase is $${(this.minPurchaseUsdCents / 100).toFixed(2)}`,
      );
    }

    const flutterwaveSecretKey = this.getEnv('FLUTTERWAVE_SECRET_KEY');
    if (!flutterwaveSecretKey) {
      throw new InternalServerErrorException('Missing FLUTTERWAVE_SECRET_KEY');
    }

    const frontendUrl = (
      this.getEnv('FRONTEND_URL') || 'http://localhost:3000'
    ).replace(/\/+$/, '');
    const orderId = randomUUID();
    const configuredSuccessUrl = this.getEnv('FLUTTERWAVE_REDIRECT_URL');
    const successUrl = configuredSuccessUrl
      ? this.decorateSuccessUrl(configuredSuccessUrl, orderId)
      : `${frontendUrl}/dashboard/settings?billing=success&order_id=${orderId}`;
    const cancelUrl =
      this.getEnv('FLUTTERWAVE_CANCEL_URL') ||
      `${frontendUrl}/dashboard/settings?billing=cancelled`;
    const redirectUrl = `${successUrl}${
      successUrl.includes('?') ? '&' : '?'
    }cancel_url=${encodeURIComponent(cancelUrl)}`;
    const currency = this.getEnv('BILLING_CURRENCY') || 'USD';

    const credits = Math.floor((amountUsdCents / 100) * this.creditsPerUsd);
    const txRef = `swiftapplyhq_${orderId}`;
    const customerEmail =
      (await this.getUserEmail(input.userId)) || 'customer@swiftapplyhq.com';

    await dbPool.query(
      `
      INSERT INTO credit_orders (
        id, "userId", "amountUsdCents", credits, status, provider, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, 'pending', 'flutterwave', NOW(), NOW())
      `,
      [orderId, input.userId, amountUsdCents, credits],
    );

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${flutterwaveSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: (amountUsdCents / 100).toFixed(2),
        currency,
        redirect_url: redirectUrl,
        payment_options: 'card,banktransfer,ussd',
        customer: {
          email: customerEmail,
          name: 'SwiftApplyHQ User',
        },
        customizations: {
          title: 'SwiftApplyHQ Credits',
          description: `${credits} credits`,
        },
        meta: {
          orderId,
          userId: input.userId,
          credits,
        },
      }),
    });

    const body = (await response.json()) as
      | {
          status?: string;
          message?: string;
          data?: { link?: string };
        }
      | undefined;

    if (!response.ok || body?.status !== 'success' || !body?.data?.link) {
      throw new InternalServerErrorException(
        body?.message || 'Failed to create Flutterwave payment link',
      );
    }

    await dbPool.query(
      `
      UPDATE credit_orders
      SET "providerSessionId" = $1, "updatedAt" = NOW()
      WHERE id = $2
      `,
      [txRef, orderId],
    );

    return {
      orderId,
      checkoutUrl: body.data.link,
      credits,
      amountUsdCents,
    };
  }

  async confirmCheckoutPayment(input: {
    userId: string;
    orderId: string;
    transactionId: string;
    txRef?: string;
  }) {
    const flutterwaveSecretKey = this.getEnv('FLUTTERWAVE_SECRET_KEY');
    if (!flutterwaveSecretKey) {
      throw new InternalServerErrorException('Missing FLUTTERWAVE_SECRET_KEY');
    }

    const orderResult = await dbPool.query(
      `
      SELECT id, "userId", credits, status, "providerSessionId", "creditedAt"
      FROM credit_orders
      WHERE id = $1
      LIMIT 1
      `,
      [input.orderId],
    );

    const order = orderResult.rows[0] as
      | {
          id: string;
          userId: string;
          credits: number;
          status: string;
          providerSessionId: string | null;
          creditedAt: string | Date | null;
        }
      | undefined;

    if (!order || order.userId !== input.userId) {
      throw new BadRequestException('Credit order not found');
    }

    if (order.creditedAt) {
      return {
        success: true,
        status: order.status,
        alreadyCredited: true,
      };
    }

    const verifyResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(
        input.transactionId,
      )}/verify`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${flutterwaveSecretKey}` },
      },
    );

    const verified = (await verifyResponse.json()) as
      | {
          status?: string;
          message?: string;
          data?: {
            id?: number;
            tx_ref?: string;
            status?: string;
            amount?: number;
            currency?: string;
          };
        }
      | undefined;

    if (
      !verifyResponse.ok ||
      verified?.status !== 'success' ||
      !verified?.data
    ) {
      throw new BadRequestException(
        verified?.message || 'Unable to verify Flutterwave payment',
      );
    }

    const expectedTxRef =
      order.providerSessionId || `swiftapplyhq_${input.orderId}`;
    if (verified.data.tx_ref !== expectedTxRef) {
      throw new BadRequestException('Payment reference mismatch');
    }
    if (input.txRef && input.txRef !== expectedTxRef) {
      throw new BadRequestException('Payment callback reference mismatch');
    }
    if (verified.data.status !== 'successful') {
      throw new BadRequestException('Payment not completed yet');
    }
    const requiredAmount = order.credits / this.creditsPerUsd;
    const actualAmount = Number(verified.data.amount ?? 0);
    if (actualAmount + 0.0001 < requiredAmount) {
      throw new BadRequestException('Paid amount is lower than required');
    }

    await this.creditOrder({
      userId: input.userId,
      orderId: order.id,
      credits: order.credits,
      sessionId: expectedTxRef,
      paymentId: String(verified.data.id ?? input.transactionId),
    });

    const user = await this.getUserBasic(input.userId);
    await sendTemplateEmail({
      kind: 'payment-success',
      user,
      credits: order.credits,
    });

    return { success: true, status: 'paid', credited: order.credits };
  }

  async handleFlutterwaveWebhook(input: {
    signature?: string;
    payload: unknown;
  }) {
    const configuredHash = this.getEnv('FLUTTERWAVE_WEBHOOK_HASH');
    if (configuredHash) {
      const received = input.signature?.trim();
      if (!received || received !== configuredHash) {
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    const event = input.payload as
      | {
          event?: string;
          data?: {
            id?: number | string;
            tx_ref?: string;
            status?: string;
          };
        }
      | undefined;

    const txRef = event?.data?.tx_ref?.trim();
    const transactionIdRaw = event?.data?.id;
    const transactionId =
      typeof transactionIdRaw === 'number' ||
      typeof transactionIdRaw === 'string'
        ? String(transactionIdRaw)
        : null;
    const status = event?.data?.status;

    if (!txRef || !transactionId) {
      return { accepted: true, ignored: true, reason: 'missing tx_ref/id' };
    }

    // Process only successful charge events.
    if (status !== 'successful') {
      return { accepted: true, ignored: true, reason: 'status not successful' };
    }

    const orderResult = await dbPool.query(
      `
      SELECT id, "userId"
      FROM credit_orders
      WHERE "providerSessionId" = $1
      LIMIT 1
      `,
      [txRef],
    );
    const order = orderResult.rows[0] as
      | { id: string; userId: string }
      | undefined;

    if (!order) {
      return { accepted: true, ignored: true, reason: 'order not found' };
    }

    const confirmed = await this.confirmCheckoutPayment({
      userId: order.userId,
      orderId: order.id,
      transactionId,
      txRef,
    });

    return { accepted: true, confirmed };
  }

  private async creditOrder(input: {
    userId: string;
    orderId: string;
    credits: number;
    sessionId: string;
    paymentId: string | null;
  }) {
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');

      const lockOrder = await client.query(
        `
        SELECT id, "creditedAt"
        FROM credit_orders
        WHERE id = $1
        FOR UPDATE
        `,
        [input.orderId],
      );

      const row = lockOrder.rows[0] as
        | { creditedAt: string | Date | null }
        | undefined;
      if (!row) {
        throw new BadRequestException('Credit order not found');
      }
      if (row.creditedAt) {
        await client.query('ROLLBACK');
        return;
      }

      const balanceBefore = await this.getCreditBalanceInternal(
        client,
        input.userId,
      );
      const balanceAfter = balanceBefore + input.credits;

      await this.upsertCreditBalanceInternal(
        client,
        input.userId,
        balanceAfter,
      );
      await client.query(
        `
        INSERT INTO credit_ledger (
          id, "userId", kind, amount, "balanceAfter", reason, meta, "createdAt"
        ) VALUES (
          $1, $2, 'purchase', $3, $4, $5, $6::jsonb, NOW()
        )
        `,
        [
          randomUUID(),
          input.userId,
          input.credits,
          balanceAfter,
          'Credit purchase',
          JSON.stringify({
            orderId: input.orderId,
            provider: 'flutterwave',
            sessionId: input.sessionId,
            paymentId: input.paymentId,
          }),
        ],
      );

      await client.query(
        `
        UPDATE credit_orders
        SET
          status = 'paid',
          "providerSessionId" = $2,
          "providerPaymentId" = $3,
          "creditedAt" = NOW(),
          "updatedAt" = NOW()
        WHERE id = $1
        `,
        [input.orderId, input.sessionId, input.paymentId],
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async consumeCredits(
    userId: string,
    amount: number,
    reason: string,
    meta: Record<string, unknown>,
  ) {
    const cost = Math.max(1, Math.floor(amount));
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');
      const current = await this.getCreditBalanceInternal(client, userId);
      if (current < cost) {
        throw new BadRequestException({
          message:
            'Insufficient credits. Upgrade to get unlimited access or buy more credits.',
          code: 'INSUFFICIENT_CREDITS',
          needed: cost,
          balance: current,
          action: 'upgrade',
        });
      }

      const next = current - cost;
      await this.upsertCreditBalanceInternal(client, userId, next);
      await client.query(
        `
        INSERT INTO credit_ledger (
          id, "userId", kind, amount, "balanceAfter", reason, meta, "createdAt"
        ) VALUES (
          $1, $2, 'usage', $3, $4, $5, $6::jsonb, NOW()
        )
        `,
        [randomUUID(), userId, -cost, next, reason, JSON.stringify(meta)],
      );

      await client.query('COMMIT');
      return { deducted: cost, balance: next };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getCreditBalance(userId: string): Promise<number> {
    const result = await dbPool.query(
      `
      SELECT balance
      FROM user_credits
      WHERE "userId" = $1
      LIMIT 1
      `,
      [userId],
    );
    const row = result.rows[0] as { balance: number } | undefined;
    return row?.balance ?? 0;
  }

  private async getUsageTotals(userId: string) {
    const result = await dbPool.query(
      `
      SELECT
        COALESCE(SUM("parseCvCount"), 0)::int AS "parseCvCount",
        COALESCE(SUM("generateEmailCount"), 0)::int AS "generateEmailCount"
      FROM ai_usage_daily
      WHERE "userId" = $1
      `,
      [userId],
    );

    return (
      (result.rows[0] as
        | { parseCvCount: number; generateEmailCount: number }
        | undefined) ?? { parseCvCount: 0, generateEmailCount: 0 }
    );
  }

  private async getCreditBalanceInternal(
    client: { query: typeof dbPool.query },
    userId: string,
  ): Promise<number> {
    const result = await client.query(
      `
      SELECT balance
      FROM user_credits
      WHERE "userId" = $1
      LIMIT 1
      `,
      [userId],
    );
    const row = result.rows[0] as { balance: number } | undefined;
    return row?.balance ?? 0;
  }

  private async upsertCreditBalanceInternal(
    client: { query: typeof dbPool.query },
    userId: string,
    balance: number,
  ) {
    await client.query(
      `
      INSERT INTO user_credits ("userId", balance, "createdAt", "updatedAt")
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT ("userId")
      DO UPDATE SET balance = EXCLUDED.balance, "updatedAt" = NOW()
      `,
      [userId, balance],
    );
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    const result = await dbPool.query(
      `
      SELECT email
      FROM "user"
      WHERE id = $1
      LIMIT 1
      `,
      [userId],
    );
    const row = result.rows[0] as { email?: string } | undefined;
    const email = row?.email?.trim();
    return email || null;
  }

  private async getUserBasic(userId: string): Promise<{
    id: string;
    email: string | null;
    name: string | null;
  }> {
    const result = await dbPool.query(
      `
      SELECT id, email, name
      FROM "user"
      WHERE id = $1
      LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0] as
      | { id: string; email?: string | null; name?: string | null }
      | undefined;

    return {
      id: row?.id || userId,
      email: row?.email?.trim() || null,
      name: row?.name?.trim() || null,
    };
  }

  private getEnv(key: string): string | null {
    const value = process.env[key];
    if (!value) return null;
    const cleaned = value.trim().replace(/^['"]|['"]$/g, '');
    return cleaned || null;
  }

  private decorateSuccessUrl(raw: string, orderId: string): string {
    const withOrder = raw.replace('{ORDER_ID}', orderId);

    try {
      const url = new URL(withOrder);
      if (!url.searchParams.has('order_id')) {
        url.searchParams.set('order_id', orderId);
      }
      if (!url.searchParams.has('billing')) {
        url.searchParams.set('billing', 'success');
      }
      return url.toString();
    } catch {
      return `${withOrder}${
        withOrder.includes('?') ? '&' : '?'
      }billing=success&order_id=${orderId}`;
    }
  }
}
