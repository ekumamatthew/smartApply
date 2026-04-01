/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException } from '@nestjs/common';
import { EmailController } from './email.controller';

jest.mock('./email.service', () => ({
  EmailService: class EmailService {},
}));

describe('EmailController', () => {
  const emailService = {
    listThreads: jest.fn(),
    listThreadMessages: jest.fn(),
    extractCvTextFromBuffer: jest.fn(),
    parseCvSections: jest.fn(),
    getStoredCvForGeneration: jest.fn(),
    generateEmail: jest.fn(),
    saveGeneratedEmail: jest.fn(),
  } as any;

  const quotaService = {
    assertAndConsume: jest.fn(),
  } as any;

  const controller = new EmailController(emailService, quotaService);
  const req = { user: { id: 'user_1' } } as any;

  beforeEach(() => {
    Object.values(emailService).forEach((fn) => fn.mockReset());
    quotaService.assertAndConsume.mockReset();
  });

  it('parses CV and consumes parse quota', async () => {
    const file = {
      buffer: Buffer.from('resume'),
      originalname: 'resume.txt',
    } as Express.Multer.File;

    emailService.extractCvTextFromBuffer.mockResolvedValue('resume text');
    emailService.parseCvSections.mockResolvedValue({
      summary: 'ok',
      skills: [],
      experience: [],
      education: [],
      certifications: [],
    });

    const result = await controller.parseCv(req, file);
    expect(result.parsed.summary).toBe('ok');
    expect(quotaService.assertAndConsume).toHaveBeenCalledWith(
      'user_1',
      'parse',
    );
  });

  it('generates email using stored CV by cvId', async () => {
    emailService.getStoredCvForGeneration.mockResolvedValue({
      fileBuffer: Buffer.from('stored'),
      originalName: 'stored.pdf',
    });
    emailService.extractCvTextFromBuffer.mockResolvedValue('cv text');
    emailService.generateEmail.mockResolvedValue({
      subject: 'Subject',
      body: 'Body',
      keyHighlights: ['A'],
    });
    emailService.saveGeneratedEmail.mockResolvedValue({
      threadId: 'thread_1',
      messageId: 'message_1',
    });

    const result = await controller.generateEmail(
      req,
      {
        cvId: 'cv_1',
        jobDescription: 'a'.repeat(40),
        recipientEmail: 'hr@example.com',
      } as any,
      undefined,
    );

    expect(result.history.threadId).toBe('thread_1');
    expect(quotaService.assertAndConsume).toHaveBeenCalledWith(
      'user_1',
      'generate',
    );
  });

  it('rejects generate when both cv and cvId are missing', async () => {
    await expect(
      controller.generateEmail(
        req,
        {
          jobDescription: 'a'.repeat(40),
          recipientEmail: 'hr@example.com',
        } as any,
        undefined,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
