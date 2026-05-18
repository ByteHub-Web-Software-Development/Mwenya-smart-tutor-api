import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from './lessons.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(() => 'test-id'),
}));
describe('LessonsService pagination', () => {
  let service: LessonsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      lessons: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
      subject: {},
      lesson_Content: {},
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
  });

  it('getAllLessons should compute skip/take from page/limit', async () => {
    prisma.lessons.findMany.mockResolvedValue([{ id: 'lesson-1' }]);
    prisma.lessons.count.mockResolvedValue(42);

    const result = await service.getAllLessons(4, 10);

    expect(prisma.lessons.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 30,
        take: 10,
      }),
    );
    expect(prisma.lessons.count).toHaveBeenCalled();

    expect(result).toEqual({
      statusCode: 200,
      message: {
        lessons: [{ id: 'lesson-1' }],
        total: 42,
        page: 4,
        limit: 10,
      },
    });
  });
});

