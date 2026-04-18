import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { BillingService } from '../billing/billing.service';
import { dbPool } from '../lib/db';

type UsageType = 'parse' | 'generate';

@Injectable()
export class EmailQuotaService {
  constructor(private readonly billingService: BillingService) {}

  private readonly quotaDisabled = this.isTruthy(process.env.AI_QUOTA_DISABLED);
  private readonly rateLimitDisabled = this.isTruthy(
    process.env.AI_RATE_LIMIT_DISABLED,
  );
  private readonly maxPerMinute = Number(process.env.AI_MAX_PER_MINUTE ?? 20);
  // "parse" bucket is used for CV optimization trial quota.
  private readonly maxParsePerDay = Number(
    process.env.AI_MAX_PARSE_PER_DAY ??
      process.env.AI_MAX_CV_GENERATE_PER_DAY ??
      4,
  );
  // "generate" bucket is used for email generation trial quota.
  private readonly maxGeneratePerDay = Number(
    process.env.AI_MAX_GENERATE_PER_DAY ??
      process.env.AI_MAX_EMAIL_GENERATE_PER_DAY ??
      4,
  );
  private readonly minuteCounters = new Map<string, number>();
  private lastCleanupMinute = 0;

  async assertAndConsume(userId: string | undefined, usageType: UsageType) {
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user id');
    }

    if (!this.rateLimitDisabled) {
      this.enforceMinuteRateLimit(userId, usageType);
    }

    // For user testing / temporary campaigns we can bypass trial quota + credits
    // checks entirely (the AI routes still require authentication).
    if (!this.quotaDisabled) {
      await this.enforceTrialQuota(userId, usageType);
    }
  }

  private enforceMinuteRateLimit(userId: string, usageType: UsageType) {
    const minuteWindow = Math.floor(Date.now() / 60000);
    this.cleanupMinuteCounters(minuteWindow);
    const key = `${userId}:${usageType}:${minuteWindow}`;
    const nextCount = (this.minuteCounters.get(key) ?? 0) + 1;
    this.minuteCounters.set(key, nextCount);

    if (nextCount > this.maxPerMinute) {
      throw this.tooManyRequests(
        `Too many AI requests. Limit is ${this.maxPerMinute}/minute.`,
      );
    }
  }

  private async enforceTrialQuota(userId: string, usageType: UsageType) {
    const date = new Date().toISOString().slice(0, 10);

    await dbPool.query(
      `
      INSERT INTO ai_usage_daily ("userId", "date", "parseCvCount", "generateEmailCount", "createdAt", "updatedAt")
      VALUES ($1, $2::date, 0, 0, NOW(), NOW())
      ON CONFLICT ("userId", "date") DO NOTHING
      `,
      [userId, date],
    );

    const totalRow = await dbPool.query(
      `
      SELECT
        COALESCE(SUM("parseCvCount"), 0)::int AS "parseCvCount",
        COALESCE(SUM("generateEmailCount"), 0)::int AS "generateEmailCount"
      FROM ai_usage_daily
      WHERE "userId" = $1
      `,
      [userId],
    );

    const total = (totalRow.rows[0] as
      | { parseCvCount: number; generateEmailCount: number }
      | undefined) ?? { parseCvCount: 0, generateEmailCount: 0 };

    if (usageType === 'parse' && total.parseCvCount >= this.maxParsePerDay) {
      await this.consumePaidCreditOrThrow(userId, usageType);
    }

    if (
      usageType === 'generate' &&
      total.generateEmailCount >= this.maxGeneratePerDay
    ) {
      await this.consumePaidCreditOrThrow(userId, usageType);
    }

    const column =
      usageType === 'parse' ? '"parseCvCount"' : '"generateEmailCount"';
    await dbPool.query(
      `
      UPDATE ai_usage_daily
      SET ${column} = ${column} + 1, "updatedAt" = NOW()
      WHERE "userId" = $1 AND "date" = $2::date
      `,
      [userId, date],
    );
  }

  private tooManyRequests(message: string | Record<string, unknown>) {
    return new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  private async consumePaidCreditOrThrow(userId: string, usageType: UsageType) {
    try {
      await this.billingService.consumeCreditsForUsage(userId, usageType);
    } catch (error) {
      if (error instanceof BadRequestException) {
        const response = error.getResponse();
        throw this.tooManyRequests(response as Record<string, unknown>);
      }
      throw error;
    }
  }

  private cleanupMinuteCounters(currentMinute: number) {
    if (this.lastCleanupMinute === currentMinute) {
      return;
    }
    this.lastCleanupMinute = currentMinute;

    for (const key of this.minuteCounters.keys()) {
      const minute = Number(key.split(':').at(-1) ?? 0);
      if (minute < currentMinute - 2) {
        this.minuteCounters.delete(key);
      }
    }
  }

  private isTruthy(value: string | undefined): boolean {
    if (!value) return false;
    const normalized = value.trim().toLowerCase();
    return (
      normalized === '1' ||
      normalized === 'true' ||
      normalized === 'yes' ||
      normalized === 'y' ||
      normalized === 'on'
    );
  }
}
