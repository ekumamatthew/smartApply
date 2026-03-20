import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { extname } from 'node:path';
import { promisify } from 'node:util';
import OpenAI from 'openai';
import { parseOfficeAsync } from 'officeparser';
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

@Injectable()
export class EmailService {
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is missing in backend/api/.env');
    }

    this.openai = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || 'gpt-5-mini';
  }

  async extractCvText(filePath: string, originalName: string): Promise<string> {
    const ext = extname(originalName).toLowerCase();

    try {
      if (ext === '.txt' || ext === '.text' || ext === '.md') {
        const raw = await fs.readFile(filePath, 'utf8');
        return this.normalizeText(raw);
      }

      if (ext === '.pdf' || ext === '.docx' || ext === '.pptx') {
        const raw = await parseOfficeAsync(filePath);
        return this.normalizeText(raw);
      }

      if (ext === '.doc') {
        const raw = await this.extractLegacyDoc(filePath);
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

Recipient email: ${dto.recipientEmail}
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

    const response = await this.openai.responses.create({
      model: this.model,
      input: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'job_application_email',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              subject: { type: 'string' },
              body: { type: 'string' },
              keyHighlights: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['subject', 'body', 'keyHighlights'],
            additionalProperties: false,
          },
        },
      },
    });

    const output = response.output_text;
    if (!output) {
      throw new InternalServerErrorException('Model returned empty output');
    }

    const parsed = JSON.parse(output) as GeneratedEmail;
    if (!parsed.subject || !parsed.body || !Array.isArray(parsed.keyHighlights)) {
      throw new InternalServerErrorException('Invalid model output shape');
    }

    return parsed;
  }

  async parseCvSections(cvText: string): Promise<ParsedCvSections> {
    const cvExcerpt = this.truncate(cvText, 14000);

    const response = await this.openai.responses.create({
      model: this.model,
      input: [
        {
          role: 'system',
          content:
            'You are a technical recruiter assistant. Extract CV content into concise structured sections without inventing facts.',
        },
        {
          role: 'user',
          content: `Extract the CV below as strict JSON with keys: summary, skills, experience, education, certifications.

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
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'parsed_cv_sections',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              skills: { type: 'array', items: { type: 'string' } },
              experience: { type: 'array', items: { type: 'string' } },
              education: { type: 'array', items: { type: 'string' } },
              certifications: { type: 'array', items: { type: 'string' } },
            },
            required: [
              'summary',
              'skills',
              'experience',
              'education',
              'certifications',
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const output = response.output_text;
    if (!output) {
      throw new InternalServerErrorException('Model returned empty CV parse output');
    }

    const parsed = JSON.parse(output) as ParsedCvSections;
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
    return value.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
  }
}
