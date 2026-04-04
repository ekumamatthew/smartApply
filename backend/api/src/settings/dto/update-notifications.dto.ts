import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationsDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  applicationUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  interviewReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  followUpReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  weeklyReports?: boolean;
}
