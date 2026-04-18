import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { createHmac, randomUUID } from 'node:crypto';
import { dbPool } from '../lib/db';
import { sendTemplateEmail } from '../lib/transactional-email';

type UsageType = 'parse' | 'generate';

// Supported currencies and their payment options
const CURRENCY_PAYMENT_OPTIONS: Record<string, string> = {
  USD: 'card',
  NGN: 'card,banktransfer,ussd',
  KES: 'card,mpesa',
  GHS: 'card,mobilemoneyghana',
};

@Injectable()
export class BillingService {
  private readonly quotaDisabled =
    (process.env.AI_QUOTA_DISABLED ?? '').trim().toLowerCase() === 'true' ||
    (process.env.AI_QUOTA_DISABLED ?? '').trim() === '1';

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

  // ─── NEW: Get live exchange rate from Flutterwave ───────────────────────────
  // source_currency = local currency, destination_currency = USD, amount = USD amount
  // The API returns source.amount = how much local currency is needed for that USD amount
  async getConvertedAmount(
    amountUsd: number,
    toCurrency: string,
  ): Promise<{ localAmount: number; rate: number }> {
    if (toCurrency === 'USD') {
      return { localAmount: amountUsd, rate: 1 };
    }

    const flutterwaveSecretKey = this.getEnv('FLW_SECRET_KEY');
    if (!flutterwaveSecretKey) {
      throw new InternalServerErrorException('Missing FLW_SECRET_KEY');
    }

    const url = new URL('https://api.flutterwave.com/v3/transfers/rates');
    url.searchParams.set('amount', String(amountUsd));
    url.searchParams.set('destination_currency', 'USD');
    url.searchParams.set('source_currency', toCurrency);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${flutterwaveSecretKey}`,
      },
    });

    const body = (await response.json()) as
      | {
          status?: string;
          message?: string;
          data?: {
            rate?: number;
            source?: { currency: string; amount: number };
            destination?: { currency: string; amount: number };
          };
        }
      | undefined;

    if (!response.ok || body?.status !== 'success' || !body?.data) {
      throw new InternalServerErrorException(
        body?.message || 'Unable to fetch exchange rate from Flutterwave',
      );
    }

    const localAmount = body.data.source?.amount ?? amountUsd;
    const rate = body.data.rate ?? 1;

    return {
      localAmount: Math.round(localAmount * 100) / 100, // round to 2 dp
      rate,
    };
  }

  // ─── NEW: Expose rates for frontend preview ─────────────────────────────────
  async getRates(
    amountUsdCents: number,
    currency: string,
  ): Promise<{
    usd: number;
    currency: string;
    localAmount: number;
    rate: number;
  }> {
    const amountUsd = amountUsdCents / 100;
    const { localAmount, rate } = await this.getConvertedAmount(
      amountUsd,
      currency,
    );
    return { usd: amountUsd, currency, localAmount, rate };
  }

  // ─── EXISTING (unchanged) ───────────────────────────────────────────────────
  async getSummary(userId: string) {
    const [usage, balance] = await Promise.all([
      this.getUsageTotals(userId),
      this.getCreditBalance(userId),
    ]);

    const parseLimit = this.quotaDisabled
      ? Number.MAX_SAFE_INTEGER
      : this.trialParseLimit;
    const generateLimit = this.quotaDisabled
      ? Number.MAX_SAFE_INTEGER
      : this.trialGenerateLimit;

    return {
      trial: {
        parseUsed: usage.parseCvCount,
        parseLimit,
        parseRemaining: Math.max(0, parseLimit - usage.parseCvCount),
        generateUsed: usage.generateEmailCount,
        generateLimit,
        generateRemaining: Math.max(
          0,
          generateLimit - usage.generateEmailCount,
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

  // ─── UPDATED: createCheckoutSession now accepts currency ────────────────────

  async createCheckoutSession(input: {
    userId: string;
    amountUsdCents: number;
    currency?: string; // NEW — defaults to USD
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

    const flutterwaveSecretKey = this.getEnv('FLW_SECRET_KEY');
    if (!flutterwaveSecretKey) {
      throw new InternalServerErrorException('Missing FLW_SECRET_KEY');
    }

    // Resolve currency — prefer request, then env, then USD
    const rawCurrency = (
      input.currency ||
      this.getEnv('FLW_CURRENCY') ||
      'USD'
    ).toUpperCase();
    const currency = CURRENCY_PAYMENT_OPTIONS[rawCurrency]
      ? rawCurrency
      : 'USD';
    const paymentOptions = CURRENCY_PAYMENT_OPTIONS[currency];

    const frontendUrl = (
      this.getEnv('FRONTEND_URL') || 'http://localhost:3000'
    ).replace(/\/+$/, '');

    const orderId = randomUUID();
    const configuredSuccessUrl = this.getEnv('FLW_REDIRECT_URL');
    const successUrl = configuredSuccessUrl
      ? this.decorateSuccessUrl(configuredSuccessUrl, orderId)
      : `${frontendUrl}/dashboard/settings?billing=success&order_id=${orderId}`;
    const cancelUrl =
      this.getEnv('FLW_CANCEL_URL') ||
      `${frontendUrl}/dashboard/settings?billing=cancelled`;
    const redirectUrl = `${successUrl}${
      successUrl.includes('?') ? '&' : '?'
    }cancel_url=${encodeURIComponent(cancelUrl)}`;

    // Credits are always calculated from USD — never from local currency
    const amountUsd = amountUsdCents / 100;
    const credits = Math.floor(amountUsd * this.creditsPerUsd);

    // NEW: convert USD to local currency via Flutterwave rates API
    const { localAmount } = await this.getConvertedAmount(amountUsd, currency);

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
        amount: localAmount, // charge in local currency
        currency, // e.g. NGN, KES, GHS, USD
        redirect_url: redirectUrl,
        payment_options: paymentOptions,
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
          usdAmount: amountUsd, // always store USD base for reference
          localCurrency: currency,
          localAmount,
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
      currency,
      localAmount,
    };
  }

  // ─── UPDATED: confirmCheckoutPayment handles multi-currency amount check ─────
  async confirmCheckoutPayment(input: {
    userId: string;
    orderId: string;
    transactionId: string;
    txRef?: string;
  }) {
    const flutterwaveSecretKey = this.getEnv('FLW_SECRET_KEY');
    if (!flutterwaveSecretKey) {
      throw new InternalServerErrorException('Missing FLW_SECRET_KEY');
    }

    const orderResult = await dbPool.query(
      `
      SELECT id, "userId", credits, "amountUsdCents", status, "providerSessionId", "creditedAt"
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
          amountUsdCents: number;
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
            meta?: { usdAmount?: number; localAmount?: number };
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

    // Amount check: use meta.localAmount if available, otherwise fall back to USD
    // This handles NGN/KES/GHS payments correctly
    const verifiedCurrency = verified.data.currency ?? 'USD';
    const actualAmount = Number(verified.data.amount ?? 0);
    const expectedLocalAmount =
      verified.data.meta?.localAmount ?? order.amountUsdCents / 100; // fallback to USD cents

    if (actualAmount + 0.01 < expectedLocalAmount) {
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

  // ─── EXISTING (unchanged) ───────────────────────────────────────────────────
  async handleFlutterwaveWebhook(input: {
    signature?: string;
    rawBody?: string;
    payload: unknown;
  }) {
    const secretHash = this.getEnv('FLW_WEBHOOK_HASH');

    if (secretHash) {
      const receivedSignature = input.signature?.trim();

      if (!receivedSignature || !input.rawBody) {
        throw new BadRequestException('Missing webhook signature or body');
      }

      const expectedHash = createHmac('sha256', secretHash)
        .update(input.rawBody)
        .digest('base64');

      if (receivedSignature !== expectedHash) {
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
