import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { type Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { extname, join } from 'node:path';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { EmailService } from './email.service';

const uploadsDir = join(process.cwd(), 'tmp', 'uploads');

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
  };
};

function createMulterStorage() {
  return diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdir(uploadsDir, { recursive: true })
        .then(() => cb(null, uploadsDir))
        .catch((error: NodeJS.ErrnoException) => cb(error, uploadsDir));
    },
    filename: (_req, file, cb) => {
      const suffix = extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${randomUUID()}${suffix}`);
    },
  });
}

@Controller('api/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('threads')
  async listThreads(@Req() req: AuthenticatedRequest) {
    const userId = this.getUserId(req);
    const threads = await this.emailService.listThreads(userId);
    return { threads };
  }

  @Get('threads/:threadId/messages')
  async listThreadMessages(
    @Req() req: AuthenticatedRequest,
    @Param('threadId') threadId: string,
  ) {
    const userId = this.getUserId(req);
    const messages = await this.emailService.listThreadMessages(
      userId,
      threadId,
    );
    return { messages };
  }

  @Post('parse-cv')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: createMulterStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async parseCv(@UploadedFile() cv?: Express.Multer.File) {
    if (!cv) {
      throw new BadRequestException(
        'CV file is required as multipart field: cv',
      );
    }

    try {
      const cvText = await this.emailService.extractCvText(
        cv.path,
        cv.originalname,
      );
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
      storage: createMulterStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async generateEmail(
    @Req() req: AuthenticatedRequest,
    @Body() dto: GenerateEmailDto,
    @UploadedFile() cv?: Express.Multer.File,
  ) {
    const userId = this.getUserId(req);

    if (!cv && !dto.cvId) {
      throw new BadRequestException(
        'Provide either a CV file (multipart field: cv) or cvId for a stored CV',
      );
    }

    const cvSource = cv
      ? {
          filePath: cv.path,
          originalName: cv.originalname,
        }
      : await this.emailService.getStoredCvForGeneration(userId, dto.cvId);

    try {
      const cvText = await this.emailService.extractCvText(
        cvSource.filePath,
        cvSource.originalName,
      );
      const result = await this.emailService.generateEmail(dto, cvText);
      const saved = await this.emailService.saveGeneratedEmail(
        userId,
        dto,
        result,
      );

      return {
        ...result,
        history: saved,
        meta: {
          cvOriginalName: cvSource.originalName,
          cvTextLength: cvText.length,
        },
      };
    } finally {
      if (cv?.path) {
        await fs.unlink(cv.path).catch(() => undefined);
      }
    }
  }

  private getUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Missing authenticated user id');
    }
    return userId;
  }
}
