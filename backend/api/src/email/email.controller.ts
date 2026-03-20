import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { extname, join } from 'node:path';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { EmailService } from './email.service';

const uploadsDir = join(process.cwd(), 'tmp', 'uploads');

@Controller('api/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('parse-cv')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: async (_req, _file, cb) => {
          await fs.mkdir(uploadsDir, { recursive: true });
          cb(null, uploadsDir);
        },
        filename: (_req, file, cb) => {
          const suffix = extname(file.originalname).toLowerCase();
          cb(null, `${Date.now()}-${randomUUID()}${suffix}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async parseCv(@UploadedFile() cv?: Express.Multer.File) {
    if (!cv) {
      throw new BadRequestException('CV file is required as multipart field: cv');
    }

    try {
      const cvText = await this.emailService.extractCvText(cv.path, cv.originalname);
      const parsed = await this.emailService.parseCvSections(cvText);

      return {
        parsed,
        meta: {
          cvOriginalName: cv.originalname,
          cvTextLength: cvText.length,
        },
      };
    } finally {
      await fs.unlink(cv.path).catch(() => undefined);
    }
  }

  @Post('generate')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: async (_req, _file, cb) => {
          await fs.mkdir(uploadsDir, { recursive: true });
          cb(null, uploadsDir);
        },
        filename: (_req, file, cb) => {
          const suffix = extname(file.originalname).toLowerCase();
          cb(null, `${Date.now()}-${randomUUID()}${suffix}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async generateEmail(
    @Body() dto: GenerateEmailDto,
    @UploadedFile() cv?: Express.Multer.File,
  ) {
    if (!cv) {
      throw new BadRequestException('CV file is required as multipart field: cv');
    }

    try {
      const cvText = await this.emailService.extractCvText(cv.path, cv.originalname);
      const result = await this.emailService.generateEmail(dto, cvText);

      return {
        ...result,
        meta: {
          cvOriginalName: cv.originalname,
          cvTextLength: cvText.length,
        },
      };
    } finally {
      await fs.unlink(cv.path).catch(() => undefined);
    }
  }
}
