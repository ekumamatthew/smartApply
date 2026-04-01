/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException } from '@nestjs/common';
import { CvController } from './cv.controller';

jest.mock('../email/email.service', () => ({
  EmailService: class EmailService {},
}));

const queryMock = jest.fn();
const getBufferMock = jest.fn();
const putBufferMock = jest.fn();
const deleteObjectMock = jest.fn();

jest.mock('../lib/db', () => ({
  dbPool: {
    query: (...args: unknown[]) => queryMock(...args),
  },
}));

jest.mock('../lib/object-storage', () => ({
  objectStorage: {
    getBuffer: (...args: unknown[]) => getBufferMock(...args),
    putBuffer: (...args: unknown[]) => putBufferMock(...args),
    deleteObject: (...args: unknown[]) => deleteObjectMock(...args),
  },
}));

describe('CvController', () => {
  const emailService = {
    extractCvTextFromBuffer: jest.fn(),
    parseCvSections: jest.fn(),
  } as any;
  const controller = new CvController(emailService);
  const req = { user: { id: 'user_1' } } as any;

  beforeEach(() => {
    queryMock.mockReset();
    getBufferMock.mockReset();
    putBufferMock.mockReset();
    deleteObjectMock.mockReset();
    emailService.extractCvTextFromBuffer.mockReset();
    emailService.parseCvSections.mockReset();
  });

  it('returns cached parsed CV when available', async () => {
    queryMock.mockResolvedValueOnce({
      rowCount: 1,
      rows: [
        {
          id: 'cv_1',
          fileName: 'resume.pdf',
          storedPath: 'cv/user_1/resume.pdf',
          parsedCvJson: {
            summary: 'cached',
            skills: [],
            experience: [],
            education: [],
            certifications: [],
          },
          parsedCvUpdatedAt: '2026-03-31T00:00:00.000Z',
        },
      ],
    });

    const result = await controller.parseOrGetCachedCv(req, 'cv_1');
    expect(result.fromCache).toBe(true);
    expect(emailService.parseCvSections).not.toHaveBeenCalled();
  });

  it('parses and stores when cache is missing', async () => {
    queryMock
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: 'cv_1',
            fileName: 'resume.pdf',
            storedPath: 'cv/user_1/resume.pdf',
            parsedCvJson: null,
            parsedCvUpdatedAt: null,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ parsedCvUpdatedAt: '2026-03-31T00:00:00.000Z' }],
      });
    getBufferMock.mockResolvedValue(Buffer.from('pdf-binary'));
    emailService.extractCvTextFromBuffer.mockResolvedValue('cv text');
    emailService.parseCvSections.mockResolvedValue({
      summary: 'new',
      skills: ['ts'],
      experience: [],
      education: [],
      certifications: [],
    });

    const result = await controller.parseOrGetCachedCv(req, 'cv_1');
    expect(result.fromCache).toBe(false);
    expect(emailService.parseCvSections).toHaveBeenCalled();
  });

  it('switches default CV correctly', async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'cv_2' }] })
      .mockResolvedValueOnce({ rowCount: 2, rows: [] })
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: 'cv_2', fileName: 'resume2.pdf', isDefault: true }],
      });

    const result = await controller.setDefaultCv(req, 'cv_2');
    expect(result.cv).toBeTruthy();
    expect(queryMock).toHaveBeenCalledTimes(3);
  });

  it('throws when CV does not belong to user', async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    await expect(
      controller.setDefaultCv(req, 'cv_missing'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
