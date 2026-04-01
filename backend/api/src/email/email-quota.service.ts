import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { dbPool } from '../lib/db';

type UsageType = 'parse' | 'generate';

@Injectable()
export class EmailQuotaService {
  private readonly maxPerMinute = Number(process.env.AI_MAX_PER_MINUTE ?? 20);
  private readonly maxParsePerDay = Number(
    process.env.AI_MAX_PARSE_PER_DAY ?? 120,
  );
  private readonly maxGeneratePerDay = Number(
    process.env.AI_MAX_GENERATE_PER_DAY ?? 80,
  );
  private readonly minuteCounters = new Map<string, number>();
  private lastCleanupMinute = 0;

  async assertAndConsume(userId: string | undefined, usageType: UsageType) {
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user id');
    }

    this.enforceMinuteRateLimit(userId, usageType);
    await this.enforceDailyQuota(userId, usageType);
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

  private async enforceDailyQuota(userId: string, usageType: UsageType) {
    const date = new Date().toISOString().slice(0, 10);

    await dbPool.query(
      `
      INSERT INTO ai_usage_daily ("userId", "date", "parseCvCount", "generateEmailCount", "createdAt", "updatedAt")
      VALUES ($1, $2::date, 0, 0, NOW(), NOW())
      ON CONFLICT ("userId", "date") DO NOTHING
      `,
      [userId, date],
    );

    const row = await dbPool.query(
      `
      SELECT "parseCvCount", "generateEmailCount"
      FROM ai_usage_daily
      WHERE "userId" = $1 AND "date" = $2::date
      LIMIT 1
      `,
      [userId, date],
    );

    const current = (row.rows[0] as
      | { parseCvCount: number; generateEmailCount: number }
      | undefined) ?? { parseCvCount: 0, generateEmailCount: 0 };

    if (usageType === 'parse' && current.parseCvCount >= this.maxParsePerDay) {
      throw this.tooManyRequests(
        `Daily parse CV quota exceeded (${this.maxParsePerDay}/day).`,
      );
    }

    if (
      usageType === 'generate' &&
      current.generateEmailCount >= this.maxGeneratePerDay
    ) {
      throw this.tooManyRequests(
        `Daily email generation quota exceeded (${this.maxGeneratePerDay}/day).`,
      );
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

  private tooManyRequests(message: string) {
    return new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
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
}
