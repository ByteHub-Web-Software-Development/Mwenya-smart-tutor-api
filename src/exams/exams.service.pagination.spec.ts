import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from './exams.service';
import { PrismaService } from '../prisma/prisma.service';

// Prevent Jest from trying to parse ESM-only dependency during unit tests
jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(() => 'test-id'),
}));


describe('ExamsService pagination', () => {
  let service: ExamsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      exam: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      subject: {},
      exam_content: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
  });

  it('getAllExams should compute skip/take from page/limit', async () => {
    prisma.exam.findMany.mockResolvedValue([{ id: 'exam-1' }]);
    prisma.exam.count.mockResolvedValue(99);

    const result = await service.getAllExams(3, 10);

    expect(prisma.exam.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
    expect(prisma.exam.count).toHaveBeenCalled();

    expect(result).toEqual({
      statusCode: 200,
      message: {
        exams: [{ id: 'exam-1' }],
        pagination: {
          currentPage: 3,
          pageSize: 10,
          total: 99,
        },
      },
    });
  });

  it('getAllExamContent should compute skip/take from page/limit', async () => {
    prisma.exam_content = undefined;

    // Patch the minimal prisma shape needed for getAllExamContent
    prisma['exam_content'] = {
      findMany: jest.fn(),
      count: jest.fn(),
    };

    prisma['exam_content'].findMany.mockResolvedValue([{ id: 'class-1' }]);
    prisma['exam_content'].count.mockResolvedValue(7);

    const result = await service.getAllExamContent(2, 5);

    expect(prisma['exam_content'].findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
      }),
    );
    expect(prisma['exam_content'].count).toHaveBeenCalled();

    expect(result).toEqual({
      statusCode: 200,
      message: {
        content: [{ id: 'class-1' }],
        page: 2,
        limit: 5,
        total: 7,
      },
    });
  });
});

