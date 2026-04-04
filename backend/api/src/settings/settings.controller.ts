import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { type Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SettingsService } from './settings.service';

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
  };
};

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@Req() req: AuthenticatedRequest) {
    const userId = this.getUserId(req);
    return this.settingsService.getSettings(userId);
  }

  @Patch('profile')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    const userId = this.getUserId(req);
    const profile = await this.settingsService.updateProfile(userId, dto);
    return { profile };
  }

  @Patch('notifications')
  async updateNotifications(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateNotificationsDto,
  ) {
    const userId = this.getUserId(req);
    const notifications = await this.settingsService.updateNotifications(
      userId,
      dto,
    );
    return { notifications };
  }

  @Public()
  @Post('waitlist')
  async joinWaitlist(@Body() dto: CreateWaitlistDto) {
    return this.settingsService.joinWaitlist(dto);
  }

  private getUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Missing authenticated user id');
    }
    return userId;
  }
}
