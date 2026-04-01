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
import { memoryStorage } from 'multer';
import { extname } from 'node:path';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { EmailQuotaService } from './email-quota.service';
import { EmailService } from './email.service';

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
  };
};

function createMulterStorage() {
  return memoryStorage();
}

@Controller('api/email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly emailQuotaService: EmailQuotaService,
  ) {}

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
  async parseCv(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() cv?: Express.Multer.File,
  ) {
    if (!cv) {
      throw new BadRequestException(
        'CV file is required as multipart field: cv',
      );
    }
    this.assertSupportedCv(cv.originalname);

    const userId = this.getUserId(req);
    await this.emailQuotaService.assertAndConsume(userId, 'parse');

    const cvText = await this.emailService.extractCvTextFromBuffer(
      cv.buffer,
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
    await this.emailQuotaService.assertAndConsume(userId, 'generate');

    if (!cv && !dto.cvId) {
      throw new BadRequestException(
        'Provide either a CV file (multipart field: cv) or cvId for a stored CV',
      );
    }
    if (cv) {
      this.assertSupportedCv(cv.originalname);
    }

    const cvSource = cv
      ? {
          fileBuffer: cv.buffer,
          originalName: cv.originalname,
        }
      : await this.emailService.getStoredCvForGeneration(userId, dto.cvId);

    const cvText = await this.emailService.extractCvTextFromBuffer(
      cvSource.fileBuffer,
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
  }

  private getUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Missing authenticated user id');
    }
    return userId;
  }

  private assertSupportedCv(fileName: string) {
    const ext = extname(fileName).toLowerCase();
    const allowed = ['.txt', '.text', '.md', '.pdf', '.docx', '.pptx', '.doc'];
    if (!allowed.includes(ext)) {
      throw new BadRequestException(
        `Unsupported CV format "${ext}". Use txt, md, pdf, docx, pptx, or doc.`,
      );
    }
  }
}
