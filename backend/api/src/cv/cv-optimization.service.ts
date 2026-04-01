import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { dbPool } from '../lib/db';
import { objectStorage } from '../lib/object-storage';
import {
  EmailService,
  type ParsedCvSections,
  type StructuredCvData,
} from '../email/email.service';
import { type OptimizeCvDto } from './dto/optimize-cv.dto';

type CvTemplateRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  standard: string;
  preview: string;
  sortOrder: number;
};

type CvDocumentRow = {
  id: string;
  fileName: string;
  storedPath: string;
  parsedCvJson: ParsedCvSections | null;
  parsedCvUpdatedAt: string | Date | null;
};

type CvOptimizationHistoryRow = {
  id: string;
  cvId: string;
  standard: string;
  templateId: string;
  templateName: string;
  jobDescription: string;
  requestedKeywords: string[] | null;
  extractedKeywords: string[] | null;
  missingKeywords: string[] | null;
  structuredCvJson: StructuredCvData | null;
  optimizedCvText: string;
  atsScore: number;
  recommendations: string[] | null;
  createdAt: string | Date;
};

@Injectable()
export class CvOptimizationService {
  constructor(private readonly emailService: EmailService) {}

  async listTemplates() {
    const result = await dbPool.query(
      `
      SELECT id, slug, name, description, standard, preview, "sortOrder"
      FROM cv_templates
      WHERE "isActive" = true
      ORDER BY "sortOrder" ASC, name ASC
      `,
    );

    return result.rows as CvTemplateRecord[];
  }

  async listOptimizations(userId: string, cvId: string) {
    const result = await dbPool.query(
      `
      SELECT
        o.id,
        o."cvId",
        o.standard,
        o."templateId",
        t.name AS "templateName",
        o."jobDescription",
        o."requestedKeywords",
        o."extractedKeywords",
        o."missingKeywords",
        o."structuredCvJson",
        o."optimizedCvText",
        o."atsScore",
        o.recommendations,
        o."createdAt"
      FROM cv_optimizations o
      INNER JOIN cv_templates t ON t.id = o."templateId"
      WHERE o."userId" = $1 AND o."cvId" = $2
      ORDER BY o."createdAt" DESC
      LIMIT 20
      `,
      [userId, cvId],
    );

    return (result.rows as CvOptimizationHistoryRow[]).map((row) => ({
      ...row,
      requestedKeywords: Array.isArray(row.requestedKeywords)
        ? row.requestedKeywords
        : [],
      extractedKeywords: Array.isArray(row.extractedKeywords)
        ? row.extractedKeywords
        : [],
      missingKeywords: Array.isArray(row.missingKeywords)
        ? row.missingKeywords
        : [],
      structuredCvJson:
        row.structuredCvJson && typeof row.structuredCvJson === 'object'
          ? row.structuredCvJson
          : null,
      recommendations: Array.isArray(row.recommendations)
        ? row.recommendations
        : [],
      createdAt: String(row.createdAt),
    }));
  }

  async optimizeCv(userId: string, dto: OptimizeCvDto) {
    const cv = await this.getTargetCv(userId, dto.cvId);
    const templates = await this.listTemplates();

    if (templates.length === 0) {
      throw new BadRequestException('No active CV templates are configured');
    }

    const selectedTemplate = this.pickTemplate(
      templates,
      dto.templateId,
      dto.standard,
    );
    const parsedCv = await this.ensureParsedCv(cv);
    const fileBuffer = await objectStorage.getBuffer(cv.storedPath);
    const cvText = await this.emailService.extractCvTextFromBuffer(
      fileBuffer,
      cv.fileName,
    );
    const requestedKeywords = this.normalizeKeywords(dto.keywords || []);

    const optimized = await this.emailService.optimizeCvForJob({
      cvText,
      parsedCv,
      jobDescription: dto.jobDescription,
      standard: dto.standard || selectedTemplate.standard,
      templateName: selectedTemplate.name,
      templateDescription: selectedTemplate.description,
      requestedKeywords,
      clientProfile: {
        name: dto.clientName,
        email: dto.clientEmail,
        phone: dto.clientPhone,
        location: dto.clientLocation,
      },
    });

    const jobDescriptionHash = this.hashDescription(dto.jobDescription);
    const optimizationId = randomUUID();

    await dbPool.query(
      `
      INSERT INTO cv_optimizations (
        id, "userId", "cvId", "templateId", standard, "jobDescription", "jobDescriptionHash",
        "requestedKeywords", "extractedKeywords", "structuredCvJson", "optimizedCvText", "atsScore",
        recommendations, "missingKeywords", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, NOW(), NOW()
      )
      `,
      [
        optimizationId,
        userId,
        cv.id,
        selectedTemplate.id,
        dto.standard || selectedTemplate.standard,
        dto.jobDescription,
        jobDescriptionHash,
        requestedKeywords,
        optimized.extractedKeywords,
        JSON.stringify(optimized.structuredCv),
        optimized.optimizedCvText,
        optimized.atsScore,
        optimized.recommendations,
        optimized.missingKeywords,
      ],
    );

    return {
      optimizationId,
      cvId: cv.id,
      cvFileName: cv.fileName,
      standard: dto.standard || selectedTemplate.standard,
      template: selectedTemplate,
      result: optimized,
    };
  }

  private pickTemplate(
    templates: CvTemplateRecord[],
    templateId?: string,
    standard?: string,
  ) {
    if (templateId) {
      const explicit = templates.find((item) => item.id === templateId);
      if (!explicit) {
        throw new BadRequestException('Selected template was not found');
      }
      return explicit;
    }

    if (standard) {
      const sameStandard = templates.find((item) => item.standard === standard);
      if (sameStandard) return sameStandard;
    }

    return templates[0];
  }

  private async getTargetCv(userId: string, cvId?: string) {
    const result = cvId
      ? await dbPool.query(
          `
          SELECT id, "fileName", "storedPath", "parsedCvJson", "parsedCvUpdatedAt"
          FROM cv_documents
          WHERE "userId" = $1 AND id = $2
          LIMIT 1
          `,
          [userId, cvId],
        )
      : await dbPool.query(
          `
          SELECT id, "fileName", "storedPath", "parsedCvJson", "parsedCvUpdatedAt"
          FROM cv_documents
          WHERE "userId" = $1
          ORDER BY "isDefault" DESC, "createdAt" DESC
          LIMIT 1
          `,
          [userId],
        );

    const row = result.rows[0] as CvDocumentRow | undefined;
    if (!row) {
      throw new BadRequestException(
        cvId
          ? 'Selected CV was not found for this user'
          : 'No CV available. Upload a CV first.',
      );
    }

    return row;
  }

  private async ensureParsedCv(cv: CvDocumentRow): Promise<ParsedCvSections> {
    if (cv.parsedCvJson) {
      return cv.parsedCvJson;
    }

    const fileBuffer = await objectStorage.getBuffer(cv.storedPath);
    const cvText = await this.emailService.extractCvTextFromBuffer(
      fileBuffer,
      cv.fileName,
    );
    const parsed = await this.emailService.parseCvSections(cvText);

    await dbPool.query(
      `
      UPDATE cv_documents
      SET "parsedCvJson" = $1::jsonb, "parsedCvUpdatedAt" = NOW(), "updatedAt" = NOW()
      WHERE id = $2
      `,
      [JSON.stringify(parsed), cv.id],
    );

    return parsed;
  }

  private hashDescription(value: string): string {
    return createHash('sha256')
      .update(
        value
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s]/g, ''),
      )
      .digest('hex');
  }

  private normalizeKeywords(values: string[]) {
    const normalized = values
      .map((item) => item.trim())
      .filter((item) => item.length > 1)
      .slice(0, 20);
    return Array.from(new Set(normalized));
  }
}
