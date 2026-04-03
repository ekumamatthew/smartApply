import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Request } from 'express';
import { memoryStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { dbPool } from '../lib/db';
import { EmailService, type ParsedCvSections } from '../email/email.service';
import { EmailQuotaService } from '../email/email-quota.service';
import { objectStorage } from '../lib/object-storage';
import { CvOptimizationService } from './cv-optimization.service';
import { OptimizeCvDto } from './dto/optimize-cv.dto';

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
  };
};

function createCvStorage() {
  return memoryStorage();
}

@Controller('api/cv')
export class CvController {
  constructor(
    private readonly emailService: EmailService,
    private readonly emailQuotaService: EmailQuotaService,
    private readonly cvOptimizationService: CvOptimizationService,
  ) {}

  @Get()
  async listCvs(@Req() req: AuthenticatedRequest) {
    const userId = this.getUserId(req);

    const result = await dbPool.query(
      `
      SELECT id, "fileName", "mimeType", "sizeBytes", "storedPath", "isDefault", "parsedCvUpdatedAt", "createdAt", "updatedAt"
      FROM cv_documents
      WHERE "userId" = $1
      ORDER BY "isDefault" DESC, "createdAt" DESC
      `,
      [userId],
    );

    return { cvs: result.rows };
  }

  @Get('templates')
  async listCvTemplates() {
    const templates = await this.cvOptimizationService.listTemplates();
    return { templates };
  }

  @Get(':id/optimizations')
  async listCvOptimizations(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(req);
    const history = await this.cvOptimizationService.listOptimizations(
      userId,
      id,
    );
    return { history };
  }

  @Post('optimize')
  async optimizeCv(
    @Req() req: AuthenticatedRequest,
    @Body() dto: OptimizeCvDto,
  ) {
    const userId = this.getUserId(req);
    await this.emailQuotaService.assertAndConsume(userId, 'parse');
    const optimization = await this.cvOptimizationService.optimizeCv(
      userId,
      dto,
    );
    return optimization;
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: createCvStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async uploadCv(
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
    const key = this.buildStorageKey(userId, cv.originalname);

    await objectStorage.putBuffer(
      key,
      cv.buffer,
      cv.mimetype || 'application/octet-stream',
    );

    const existing = await dbPool.query(
      'SELECT id FROM cv_documents WHERE "userId" = $1 AND "isDefault" = true LIMIT 1',
      [userId],
    );

    const insertResult = await dbPool.query(
      `
      INSERT INTO cv_documents (
        id, "userId", "fileName", "storedPath", "mimeType", "sizeBytes", "isDefault", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, "fileName", "mimeType", "sizeBytes", "storedPath", "isDefault", "createdAt", "updatedAt"
      `,
      [
        randomUUID(),
        userId,
        cv.originalname,
        key,
        cv.mimetype,
        cv.size,
        existing.rowCount === 0,
      ],
    );

    const inserted = insertResult.rows[0] as
      | Record<string, unknown>
      | undefined;
    const insertedCv = inserted ?? null;

    if (!insertedCv || !insertedCv.id || typeof insertedCv.id !== 'string') {
      return { cv: insertedCv };
    }

    const parsed = await this.ensureParsedCv(userId, insertedCv.id);
    return { cv: insertedCv, parsed };
  }

  @Get(':id/parsed')
  async parseOrGetCachedCv(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('refresh') refresh?: string,
  ) {
    const userId = this.getUserId(req);
    const forceRefresh =
      typeof refresh === 'string' &&
      (refresh.toLowerCase() === 'true' || refresh === '1');

    const parsed = await this.ensureParsedCv(userId, id, forceRefresh);
    return parsed;
  }

  @Patch(':id/default')
  async setDefaultCv(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(req);

    const exists = await dbPool.query(
      'SELECT id FROM cv_documents WHERE id = $1 AND "userId" = $2 LIMIT 1',
      [id, userId],
    );

    if (exists.rowCount === 0) {
      throw new BadRequestException('CV not found for user');
    }

    await dbPool.query(
      'UPDATE cv_documents SET "isDefault" = false, "updatedAt" = NOW() WHERE "userId" = $1',
      [userId],
    );

    const updated = await dbPool.query(
      'UPDATE cv_documents SET "isDefault" = true, "updatedAt" = NOW() WHERE id = $1 AND "userId" = $2 RETURNING id, "fileName", "isDefault", "updatedAt"',
      [id, userId],
    );

    const updatedCv = updated.rows[0] as Record<string, unknown> | undefined;
    return { cv: updatedCv ?? null };
  }

  @Delete(':id')
  async deleteCv(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = this.getUserId(req);

    const existing = await dbPool.query(
      'SELECT id, "storedPath", "isDefault" FROM cv_documents WHERE id = $1 AND "userId" = $2 LIMIT 1',
      [id, userId],
    );

    if (existing.rowCount === 0) {
      throw new BadRequestException('CV not found for user');
    }

    const row = existing.rows[0] as {
      storedPath: string;
      isDefault: boolean;
    };

    await dbPool.query(
      'DELETE FROM cv_documents WHERE id = $1 AND "userId" = $2',
      [id, userId],
    );
    await objectStorage.deleteObject(row.storedPath).catch(() => undefined);

    if (row.isDefault) {
      const fallback = await dbPool.query(
        'SELECT id FROM cv_documents WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
        [userId],
      );

      if ((fallback.rowCount ?? 0) > 0) {
        const fallbackRow = fallback.rows[0] as { id: string } | undefined;
        if (!fallbackRow?.id) {
          return { success: true };
        }
        await dbPool.query(
          'UPDATE cv_documents SET "isDefault" = true, "updatedAt" = NOW() WHERE id = $1',
          [fallbackRow.id],
        );
      }
    }

    return { success: true };
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

  private async ensureParsedCv(userId: string, cvId: string, force = false) {
    const existing = await dbPool.query(
      `
      SELECT id, "fileName", "storedPath", "parsedCvJson", "parsedCvUpdatedAt"
      FROM cv_documents
      WHERE id = $1 AND "userId" = $2
      LIMIT 1
      `,
      [cvId, userId],
    );

    if (existing.rowCount === 0) {
      throw new BadRequestException('CV not found for user');
    }

    const row = existing.rows[0] as {
      id: string;
      fileName: string;
      storedPath: string;
      parsedCvJson: ParsedCvSections | null;
      parsedCvUpdatedAt: string | Date | null;
    };

    if (!force && row.parsedCvJson) {
      return {
        cvId: row.id,
        fileName: row.fileName,
        parsed: row.parsedCvJson,
        fromCache: true,
        parsedAt: row.parsedCvUpdatedAt,
      };
    }

    const buffer = await objectStorage.getBuffer(row.storedPath);
    const cvText = await this.emailService.extractCvTextFromBuffer(
      buffer,
      row.fileName,
    );
    const parsed = await this.emailService.parseCvSections(cvText);

    const updated = await dbPool.query(
      `
      UPDATE cv_documents
      SET "parsedCvJson" = $1::jsonb, "parsedCvUpdatedAt" = NOW(), "updatedAt" = NOW()
      WHERE id = $2
      RETURNING "parsedCvUpdatedAt"
      `,
      [JSON.stringify(parsed), row.id],
    );
    const updatedRow = updated.rows[0] as
      | { parsedCvUpdatedAt: string | Date | null }
      | undefined;

    return {
      cvId: row.id,
      fileName: row.fileName,
      parsed,
      fromCache: false,
      parsedAt: updatedRow?.parsedCvUpdatedAt ?? null,
    };
  }

  private buildStorageKey(userId: string, originalName: string): string {
    const suffix = extname(originalName).toLowerCase();
    return `cv/${userId}/${Date.now()}-${randomUUID()}${suffix}`;
  }
}
