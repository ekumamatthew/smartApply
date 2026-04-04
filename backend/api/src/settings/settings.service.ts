import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { dbPool } from '../lib/db';
import { sendTemplateEmail } from '../lib/transactional-email';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export type SettingsProfile = {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  professionalSummary: string;
};

export type SettingsNotifications = {
  emailNotifications: boolean;
  applicationUpdates: boolean;
  interviewReminders: boolean;
  followUpReminders: boolean;
  weeklyReports: boolean;
};

@Injectable()
export class SettingsService {
  async getSettings(userId: string): Promise<{
    profile: SettingsProfile;
    notifications: SettingsNotifications;
  }> {
    const [profile, notifications] = await Promise.all([
      this.getProfile(userId),
      this.getNotifications(userId),
    ]);

    return { profile, notifications };
  }

  async getProfile(userId: string): Promise<SettingsProfile> {
    const result = await dbPool.query(
      `
      SELECT
        u.name,
        u.email,
        p.phone,
        p.linkedin,
        p."professionalSummary"
      FROM "user" u
      LEFT JOIN user_profiles p ON p."userId" = u.id
      WHERE u.id = $1
      LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0] as
      | {
          name?: string;
          email?: string;
          phone?: string | null;
          linkedin?: string | null;
          professionalSummary?: string | null;
        }
      | undefined;

    return {
      fullName: row?.name?.trim() || '',
      email: row?.email?.trim() || '',
      phone: row?.phone?.trim() || '',
      linkedin: row?.linkedin?.trim() || '',
      professionalSummary: row?.professionalSummary?.trim() || '',
    };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<SettingsProfile> {
    const fullName = dto.fullName?.trim();
    const phone = dto.phone?.trim() || null;
    const linkedin = dto.linkedin?.trim() || null;
    const professionalSummary = dto.professionalSummary?.trim() || null;

    if (fullName && fullName.length > 0) {
      await dbPool.query(
        `
        UPDATE "user"
        SET name = $2, "updatedAt" = NOW()
        WHERE id = $1
        `,
        [userId, fullName],
      );
    }

    await dbPool.query(
      `
      INSERT INTO user_profiles (
        "userId", phone, linkedin, "professionalSummary", "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT ("userId")
      DO UPDATE
      SET
        phone = EXCLUDED.phone,
        linkedin = EXCLUDED.linkedin,
        "professionalSummary" = EXCLUDED."professionalSummary",
        "updatedAt" = NOW()
      `,
      [userId, phone, linkedin, professionalSummary],
    );

    return this.getProfile(userId);
  }

  async getNotifications(userId: string): Promise<SettingsNotifications> {
    const result = await dbPool.query(
      `
      SELECT
        "emailNotifications",
        "applicationUpdates",
        "interviewReminders",
        "followUpReminders",
        "weeklyReports"
      FROM user_notification_settings
      WHERE "userId" = $1
      LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0] as
      | {
          emailNotifications?: boolean;
          applicationUpdates?: boolean;
          interviewReminders?: boolean;
          followUpReminders?: boolean;
          weeklyReports?: boolean;
        }
      | undefined;

    return {
      emailNotifications: row?.emailNotifications ?? true,
      applicationUpdates: row?.applicationUpdates ?? true,
      interviewReminders: row?.interviewReminders ?? true,
      followUpReminders: row?.followUpReminders ?? false,
      weeklyReports: row?.weeklyReports ?? false,
    };
  }

  async updateNotifications(
    userId: string,
    dto: UpdateNotificationsDto,
  ): Promise<SettingsNotifications> {
    const current = await this.getNotifications(userId);

    const next: SettingsNotifications = {
      emailNotifications: dto.emailNotifications ?? current.emailNotifications,
      applicationUpdates: dto.applicationUpdates ?? current.applicationUpdates,
      interviewReminders: dto.interviewReminders ?? current.interviewReminders,
      followUpReminders: dto.followUpReminders ?? current.followUpReminders,
      weeklyReports: dto.weeklyReports ?? current.weeklyReports,
    };

    await dbPool.query(
      `
      INSERT INTO user_notification_settings (
        "userId",
        "emailNotifications",
        "applicationUpdates",
        "interviewReminders",
        "followUpReminders",
        "weeklyReports",
        "createdAt",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT ("userId")
      DO UPDATE
      SET
        "emailNotifications" = EXCLUDED."emailNotifications",
        "applicationUpdates" = EXCLUDED."applicationUpdates",
        "interviewReminders" = EXCLUDED."interviewReminders",
        "followUpReminders" = EXCLUDED."followUpReminders",
        "weeklyReports" = EXCLUDED."weeklyReports",
        "updatedAt" = NOW()
      `,
      [
        userId,
        next.emailNotifications,
        next.applicationUpdates,
        next.interviewReminders,
        next.followUpReminders,
        next.weeklyReports,
      ],
    );

    return next;
  }

  async joinWaitlist(dto: CreateWaitlistDto) {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name?.trim() || null;
    const source = dto.source?.trim() || 'web';

    const inserted = await dbPool.query(
      `
      INSERT INTO waitlist_subscribers (id, email, name, source, "createdAt")
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (email)
      DO UPDATE SET name = EXCLUDED.name, source = EXCLUDED.source
      RETURNING id
      `,
      [randomUUID(), email, name, source],
    );
    const insertedRow = inserted.rows[0] as { id?: string } | undefined;

    await sendTemplateEmail({
      kind: 'waitlist-followup',
      user: {
        email,
        name,
      },
    });

    return {
      success: true,
      id: insertedRow?.id ? String(insertedRow.id) : '',
    };
  }
}
