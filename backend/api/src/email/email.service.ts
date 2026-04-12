import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { OpenRouter } from '@openrouter/sdk';
import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname } from 'node:path';
import { promisify } from 'node:util';
import { parseOfficeAsync } from 'officeparser';
import { dbPool } from '../lib/db';
import { objectStorage } from '../lib/object-storage';
import { GenerateEmailDto } from './dto/generate-email.dto';

const execFileAsync = promisify(execFile);

export type GeneratedEmail = {
  subject: string;
  body: string;
  keyHighlights: string[];
};

export type ParsedCvSections = {
  summary: string;
  skills: string[];
  experience: string[];
  education: string[];
  certifications: string[];
};

export type OptimizedCvResult = {
  optimizedCvText: string;
  extractedKeywords: string[];
  missingKeywords: string[];
  atsScore: number;
  recommendations: string[];
  structuredCv: StructuredCvData;
};

export type StructuredCvData = {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    links: string[];
  };
  targetRole: string;
  summary: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    period: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    period: string;
    details: string[];
  }>;
  certifications: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
};

export type EmailThreadSummary = {
  id: string;
  jobDescription: string;
  jobDescriptionHash: string;
  emailCount: number;
  latestEmailSubject: string | null;
  latestAt: string;
};

export type EmailHistoryItem = {
  id: string;
  promptContext: string | null;
  tone: string | null;
  subject: string;
  body: string;
  keyHighlights: string[];
  createdAt: string;
};

type DbEmailHistoryRow = {
  id: string;
  promptContext: string | null;
  tone: string | null;
  subject: string;
  body: string;
  keyHighlights: string[] | null;
  createdAt: string | Date;
};

type DbThreadRow = { id: string };

@Injectable()
export class EmailService {
  private readonly openrouter: OpenRouter;
  private readonly model: string;

  constructor() {
    const openRouterApiKey = this.getEnv('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is missing in backend/api/.env');
    }

    this.openrouter = new OpenRouter({ apiKey: openRouterApiKey });
    this.model =
      this.getEnv('OPENROUTER_MODEL') ||
      'nvidia/nemotron-3-super-120b-a12b:free';
  }

  async extractCvText(filePath: string, originalName: string): Promise<string> {
    const raw = await fs.readFile(filePath);
    return this.extractCvTextFromBuffer(raw, originalName);
  }

  async extractCvTextFromBuffer(
    fileBuffer: Buffer,
    originalName: string,
  ): Promise<string> {
    const ext = extname(originalName).toLowerCase();

    try {
      if (ext === '.txt' || ext === '.text' || ext === '.md') {
        return this.normalizeText(fileBuffer.toString('utf8'));
      }

      if (ext === '.pdf' || ext === '.docx' || ext === '.pptx') {
        const tempPath = await this.writeTempFile(fileBuffer, ext);
        const raw = await parseOfficeAsync(tempPath);
        await fs.unlink(tempPath).catch(() => undefined);
        return this.normalizeText(raw);
      }

      if (ext === '.doc') {
        const raw = await this.extractLegacyDocFromBuffer(fileBuffer);
        return this.normalizeText(raw);
      }

      throw new BadRequestException(
        'Unsupported CV format. Use txt, pdf, docx, pptx, or doc.',
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Could not read CV file. For .doc files, install antiword or libreoffice.',
      );
    }
  }

  async generateEmail(
    dto: GenerateEmailDto,
    cvText: string,
  ): Promise<GeneratedEmail> {
    const cvExcerpt = this.truncate(cvText, 12000);
    const descriptionExcerpt = this.truncate(dto.jobDescription, 10000);

    const systemPrompt =
      'You are an expert career coach and recruiter. Write concise, specific, professional job application emails. Avoid fluff. Use concrete evidence from the CV and align to the job description.';

    const userPrompt = `Write a tailored job application email as strict JSON with keys: subject, body, keyHighlights.

Recipient email: ${dto.recipientEmail || 'Not specified'}
Recipient name: ${dto.recipientName || 'Hiring Manager'}
Applicant name: ${dto.applicantName || 'Applicant'}
Tone: ${dto.tone || 'professional'}
Additional context: ${dto.additionalContext || 'none'}

Job Description:
${descriptionExcerpt}

CV Content:
${cvExcerpt}

Requirements:
- Subject must be <= 90 characters.
- Body must be 120-220 words.
- Mention 2-4 relevant strengths/experience points from CV.
- Include a clear closing line and availability for interview.
- Do not invent facts not present in CV/job description.
- keyHighlights should be an array of 3-5 short bullet strings.
`;

    const output = await this.generateJson(systemPrompt, userPrompt);

    const parsed = this.parseJsonFromText(output) as GeneratedEmail;
    if (
      !parsed.subject ||
      !parsed.body ||
      !Array.isArray(parsed.keyHighlights)
    ) {
      throw new InternalServerErrorException('Invalid model output shape');
    }

    return parsed;
  }

  async parseCvSections(cvText: string): Promise<ParsedCvSections> {
    const cvExcerpt = this.truncate(cvText, 14000);

    const output = await this.generateJson(
      'You are a technical recruiter assistant. Extract CV content into concise structured sections without inventing facts.',
      `Extract the CV below as strict JSON with keys: summary, skills, experience, education, certifications.

Rules:
- summary: 2-3 sentences, max 400 chars.
- skills: 6-15 items.
- experience: 2-8 short bullets with role/company/impact if present.
- education: 0-5 bullets.
- certifications: 0-5 items.
- Do not fabricate details.

CV:
${cvExcerpt}
`,
    );

    const parsed = this.parseJsonFromText(output) as ParsedCvSections;
    if (
      !parsed.summary ||
      !Array.isArray(parsed.skills) ||
      !Array.isArray(parsed.experience) ||
      !Array.isArray(parsed.education) ||
      !Array.isArray(parsed.certifications)
    ) {
      throw new InternalServerErrorException('Invalid parsed CV output shape');
    }

    return parsed;
  }

  async optimizeCvForJob(input: {
    cvText: string;
    parsedCv: ParsedCvSections;
    jobDescription: string;
    standard: string;
    templateName: string;
    templateDescription: string;
    requestedKeywords: string[];
    clientProfile?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
    };
  }): Promise<OptimizedCvResult> {
    const cvExcerpt = this.truncate(input.cvText, 14000);
    const jobExcerpt = this.truncate(input.jobDescription, 12000);
    const requestedKeywords = input.requestedKeywords.length
      ? input.requestedKeywords.join(', ')
      : 'none';
    const clientHints = JSON.stringify(
      {
        name: input.clientProfile?.name || null,
        email: input.clientProfile?.email || null,
        phone: input.clientProfile?.phone || null,
        location: input.clientProfile?.location || null,
      },
      null,
      2,
    );

    const output = await this.generateJson(
      'You are an expert CV optimizer. Rewrite CVs to match job descriptions while staying truthful and ATS-ready.',
      `Return strict JSON with keys:
- optimizedCvText (string)
- extractedKeywords (string[])
- missingKeywords (string[])
- atsScore (number 0-100)
- recommendations (string[])
- structuredCv (object)

structuredCv schema:
{
  "personal": { "name": string, "email": string, "phone": string, "location": string, "links": string[] },
  "targetRole": string,
  "summary": string,
  "skills": string[],
  "experience": [{ "title": string, "company": string, "period": string, "highlights": string[] }],
  "education": [{ "institution": string, "degree": string, "period": string, "details": string[] }],
  "certifications": string[],
  "projects": [{ "name": string, "description": string, "technologies": string[] }]
}

Rules:
- Do not invent experience, certifications, or education that are not in CV.
- Optimize for standard: ${input.standard}
- Use this template style: ${input.templateName} - ${input.templateDescription}
- Incorporate requested keywords when truthful: ${requestedKeywords}
- Preserve and surface client identity/contact details at the top of CV.
- Client hints (prefer when provided, else infer from CV): ${clientHints}
- Make optimizedCvText concise, professional, and scannable.
- Ensure extractedKeywords has 6-20 relevant terms from job description.
- recommendations must have 3-8 actionable bullets.

Job Description:
${jobExcerpt}

Parsed CV:
${JSON.stringify(input.parsedCv)}

Raw CV:
${cvExcerpt}
`,
    );

    const parsed = this.parseJsonFromText(output) as OptimizedCvResult;
    if (
      !parsed ||
      typeof parsed.optimizedCvText !== 'string' ||
      !Array.isArray(parsed.extractedKeywords) ||
      !Array.isArray(parsed.missingKeywords) ||
      !Array.isArray(parsed.recommendations) ||
      typeof parsed.atsScore !== 'number' ||
      !parsed.structuredCv ||
      typeof parsed.structuredCv !== 'object' ||
      !parsed.structuredCv.personal ||
      typeof parsed.structuredCv.personal !== 'object'
    ) {
      throw new InternalServerErrorException(
        'Invalid optimized CV output shape',
      );
    }

    return {
      optimizedCvText: parsed.optimizedCvText.trim(),
      extractedKeywords: parsed.extractedKeywords,
      missingKeywords: parsed.missingKeywords,
      recommendations: parsed.recommendations,
      atsScore: Math.max(0, Math.min(100, Math.round(parsed.atsScore))),
      structuredCv: parsed.structuredCv,
    };
  }

  async listThreads(userId: string): Promise<EmailThreadSummary[]> {
    const result = await dbPool.query(
      `
      SELECT
        t.id,
        t."jobDescription",
        t."jobDescriptionHash",
        COUNT(m.id)::int AS "emailCount",
        (
          SELECT m2.subject
          FROM email_messages m2
          WHERE m2."threadId" = t.id
          ORDER BY m2."createdAt" DESC
          LIMIT 1
        ) AS "latestEmailSubject",
        COALESCE(MAX(m."createdAt"), t."updatedAt") AS "latestAt"
      FROM email_threads t
      LEFT JOIN email_messages m ON m."threadId" = t.id
      WHERE t."userId" = $1
      GROUP BY t.id, t."jobDescription", t."jobDescriptionHash", t."updatedAt"
      ORDER BY "latestAt" DESC
      `,
      [userId],
    );

    return result.rows as EmailThreadSummary[];
  }

  async listThreadMessages(
    userId: string,
    threadId: string,
  ): Promise<EmailHistoryItem[]> {
    const result = await dbPool.query(
      `
      SELECT
        m.id,
        m."promptContext",
        m.tone,
        m.subject,
        m.body,
        m."keyHighlights",
        m."createdAt"
      FROM email_messages m
      INNER JOIN email_threads t ON t.id = m."threadId"
      WHERE m."threadId" = $1 AND t."userId" = $2
      ORDER BY m."createdAt" DESC
      `,
      [threadId, userId],
    );

    return (result.rows as DbEmailHistoryRow[]).map((row) => ({
      id: row.id,
      promptContext: row.promptContext,
      tone: row.tone,
      subject: row.subject,
      body: row.body,
      keyHighlights: Array.isArray(row.keyHighlights) ? row.keyHighlights : [],
      createdAt: String(row.createdAt),
    }));
  }

  async getStoredCvForGeneration(userId: string, cvId?: string) {
    const result = cvId
      ? await dbPool.query(
          `
          SELECT id, "fileName", "storedPath", "isDefault"
          FROM cv_documents
          WHERE "userId" = $1 AND id = $2
          LIMIT 1
          `,
          [userId, cvId],
        )
      : await dbPool.query(
          `
          SELECT id, "fileName", "storedPath", "isDefault"
          FROM cv_documents
          WHERE "userId" = $1
          ORDER BY "isDefault" DESC, "createdAt" DESC
          LIMIT 1
          `,
          [userId],
        );

    const row = result.rows[0] as
      | { id: string; fileName: string; storedPath: string; isDefault: boolean }
      | undefined;

    if (!row) {
      throw new BadRequestException(
        cvId
          ? 'Selected CV was not found for this user'
          : 'No CV available. Upload a CV first or select one explicitly.',
      );
    }

    try {
      const fileBuffer = await objectStorage.getBuffer(row.storedPath);
      return {
        cvId: row.id,
        fileBuffer,
        originalName: row.fileName,
        isDefault: row.isDefault,
      };
    } catch {
      throw new BadRequestException(
        `Stored CV file is missing in object storage: ${row.fileName}`,
      );
    }
  }

  async saveGeneratedEmail(
    userId: string,
    dto: GenerateEmailDto,
    generated: GeneratedEmail,
  ) {
    const normalizedJobDescription = this.normalizeJobDescription(
      dto.jobDescription,
    );
    const hash = createHash('sha256')
      .update(normalizedJobDescription)
      .digest('hex');

    const existingThread = await dbPool.query(
      'SELECT id FROM email_threads WHERE "userId" = $1 AND "jobDescriptionHash" = $2 LIMIT 1',
      [userId, hash],
    );

    const existingThreadRow =
      (existingThread.rows[0] as DbThreadRow | undefined) ?? undefined;
    const threadId = existingThreadRow?.id || randomUUID();

    if (existingThread.rowCount === 0) {
      await dbPool.query(
        `
        INSERT INTO email_threads (
          id, "userId", "jobDescription", "jobDescriptionHash", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, NOW(), NOW())
        `,
        [threadId, userId, dto.jobDescription, hash],
      );
    } else {
      await dbPool.query(
        'UPDATE email_threads SET "updatedAt" = NOW() WHERE id = $1',
        [threadId],
      );
    }

    const messageId = randomUUID();
    await dbPool.query(
      `
      INSERT INTO email_messages (
        id, "threadId", "promptContext", tone, subject, body, "keyHighlights", "createdAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `,
      [
        messageId,
        threadId,
        dto.additionalContext || null,
        dto.tone || null,
        generated.subject,
        generated.body,
        generated.keyHighlights,
      ],
    );

    return { threadId, messageId };
  }

  private async extractLegacyDoc(filePath: string): Promise<string> {
    try {
      const { stdout } = await execFileAsync('antiword', [filePath]);
      if (stdout?.trim()) {
        return stdout;
      }
    } catch {
      // continue to libreoffice fallback
    }

    const outDir = '/tmp';
    await execFileAsync('soffice', [
      '--headless',
      '--convert-to',
      'txt:Text',
      '--outdir',
      outDir,
      filePath,
    ]);

    const convertedPath = `${outDir}/${this.getBaseName(filePath)}.txt`;
    const raw = await fs.readFile(convertedPath, 'utf8');
    await fs.unlink(convertedPath).catch(() => undefined);
    return raw;
  }

  private async extractLegacyDocFromBuffer(
    fileBuffer: Buffer,
  ): Promise<string> {
    const tempPath = await this.writeTempFile(fileBuffer, '.doc');
    try {
      return await this.extractLegacyDoc(tempPath);
    } finally {
      await fs.unlink(tempPath).catch(() => undefined);
    }
  }

  private async writeTempFile(buffer: Buffer, ext: string): Promise<string> {
    const path = `${tmpdir()}/${Date.now()}-${randomUUID()}${ext}`;
    await fs.writeFile(path, buffer);
    return path;
  }

  private getBaseName(filePath: string): string {
    const parts = filePath.split('/').pop() || '';
    return parts.replace(/\.[^/.]+$/, '');
  }

  private truncate(value: string, maxLength: number): string {
    return value.length <= maxLength
      ? value
      : `${value.slice(0, maxLength)}\n...[truncated]`;
  }

  private normalizeText(value: string): string {
    return value
      .replace(/\r/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private async generateJson(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    try {
      const responseUnknown: unknown = await this.openrouter.chat.send({
        chatGenerationParams: {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `${systemPrompt}\nReturn valid JSON only. No markdown code fences.`,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        },
      });

      const response = responseUnknown as {
        choices?: Array<{ message?: { content?: unknown } }>;
      };

      const content = response.choices?.[0]?.message?.content;
      if (typeof content === 'string' && content.trim()) {
        return content;
      }

      if (Array.isArray(content)) {
        const joined = content
          .map((part: unknown) => {
            if (
              typeof part === 'object' &&
              part !== null &&
              'type' in part &&
              'text' in part &&
              (part as { type?: unknown }).type === 'text'
            ) {
              return String((part as { text: unknown }).text);
            }
            return '';
          })
          .join('');

        if (joined.trim()) {
          return joined;
        }
      }

      throw new InternalServerErrorException(
        'OpenRouter returned empty content',
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `OpenRouter request failed: ${this.errorToMessage(error)}`,
      );
    }
  }

  private parseJsonFromText(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      const cleaned = value
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();
      return JSON.parse(cleaned);
    }
  }

  private errorToMessage(error: unknown): string {
    if (!error) return 'none';
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'unknown error';
  }

  private getEnv(key: string): string | null {
    const value = process.env[key];
    if (!value) return null;
    const cleaned = value.trim().replace(/^['"]|['"]$/g, '');
    return cleaned || null;
  }

  private normalizeJobDescription(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }
}
