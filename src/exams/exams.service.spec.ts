import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from './exams.service';
import { PrismaService } from '../prisma/prisma.service';

// Prevent Jest from trying to parse ESM-only dependency during unit tests
jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(() => 'test-id'),
}));

describe('ExamsService', () => {
  let service: ExamsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      subject: {
        findUnique: jest.fn(),
      },
      exam: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      exam_content: {
        findMany: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addExam', () => {
    it('adds an exam when subject exists', async () => {
      prisma.subject.findUnique.mockResolvedValue({ id: 'subject-1' });
      prisma.exam.create.mockResolvedValue({
        id: 'test-id',
        title: 'Exam 1',
        duration: 60,
        media_type: 'url',
        media_value: 'http://x',
        year: '2026',
        subject_id: 'subject-1',
      });

      const result = await service.addExam({
        title: 'Exam 1',
        duration: 60,
        media_type: 'url',
        media_value: 'http://x',
        year: '2026',
        subject: 'subject-1',
      } as any);

      expect(prisma.subject.findUnique).toHaveBeenCalledWith({ where: { id: 'subject-1' } });
      expect(prisma.exam.create).toHaveBeenCalledWith({
        data: {
          id: 'testidtestid',
          title: 'Exam 1',
          duration: 60,
          media_type: 'url',
          media_value: 'http://x',
          year: '2026',
          subject_id: 'subject-1',
        },
      });

      expect(result).toEqual({
        statusCode: 201,
        message: {
          description: 'Exam added successfully',
          exam: expect.objectContaining({ id: 'test-id' }),
        },
      });
    });

    it('throws NotFoundException when subject does not exist (propagates)', async () => {
      prisma.subject.findUnique.mockResolvedValue(null);

      await expect(
        service.addExam({
          title: 'Exam 1',
          duration: 60,
          media_type: 'url',
          media_value: 'http://x',
          year: '2026',
          subject: 'missing-sub',
        } as any),
      ).rejects.toThrow(new NotFoundException('Subject missing-sub not found'));

      expect(prisma.exam.create).not.toHaveBeenCalled();
    });
  });

  describe('getExam', () => {
    it('returns an exam with exam_content when found', async () => {
      prisma.exam.findUnique.mockResolvedValue({
        id: 'exam-1',
        title: 'Exam 1',
        exam_content: [{ id: 'class-1' }],
      });

      const result = await service.getExam('exam-1');

      expect(prisma.exam.findUnique).toHaveBeenCalledWith({
        where: { id: 'exam-1' },
        include: { exam_content: true },
      });
      expect(result).toEqual({ statusCode: 200, message: { exam: expect.any(Object) } });
    });

    it('throws NotFoundException when exam is missing (propagates)', async () => {
      prisma.exam.findUnique.mockResolvedValue(null);

      await expect(service.getExam('missing')).rejects.toThrow(
        new NotFoundException('Exam missing not found'),
      );
    });
  });

  describe('getAllExams', () => {
    it('computes skip/take and orders by year desc', async () => {
      prisma.exam.findMany.mockResolvedValue([{ id: 'exam-1' }]);
      prisma.exam.count.mockResolvedValue(50);

      const result = await service.getAllExams(3, 10);

      expect(prisma.exam.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
          orderBy: { year: 'desc' },
          include: { exam_content: true },
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
            total: 50,
          },
        },
      });
    });

    it('returns empty list and total=0 when there are no exams', async () => {
      prisma.exam.findMany.mockResolvedValue([]);
      prisma.exam.count.mockResolvedValue(0);

      const result = await service.getAllExams(1, 20);

      expect(result.message.exams).toEqual([]);
      expect(result.message.pagination.currentPage).toBe(1);
      expect(result.message.pagination.pageSize).toBe(20);
    });
  });

  describe('addExamContent', () => {
    it('adds exam content when parent exam exists', async () => {
      prisma.exam.findUnique.mockResolvedValue({ id: 'exam-1' });
      prisma.exam_content.create.mockResolvedValue({
        id: 'content-1',
        examId: 'exam-1',
        examType: 'mcq',
        examLink: 'http://link',
      });

      const result = await service.addExamContent({
        exam: 'exam-1',
        exam_type: 'mcq',
        exam_link: 'http://link',
      } as any);

      expect(prisma.exam.findUnique).toHaveBeenCalledWith({ where: { id: 'exam-1' } });
      expect(prisma.exam_content.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          examId: 'exam-1',
          examType: 'mcq',
          examLink: 'http://link',
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      });
      expect(result.statusCode).toBe(201);
      expect(result.message.description).toBe('Exam content added successfully');
      expect(result.message.content).toEqual(expect.objectContaining({ id: 'content-1' }));
    });

    it('throws NotFoundException when parent exam is missing (propagates)', async () => {
      prisma.exam.findUnique.mockResolvedValue(null);

      await expect(
        service.addExamContent({
          exam: 'missing-exam',
          exam_type: 'mcq',
          exam_link: 'http://link',
        } as any),
      ).rejects.toThrow(new NotFoundException('Exam missing-exam not found'));

      expect(prisma.exam_content.create).not.toHaveBeenCalled();
    });
  });

  describe('getExamContent', () => {
    it('returns exam content list ordered by created_at desc when found', async () => {
      prisma.exam.findUnique.mockResolvedValue({ id: 'exam-1' });
      prisma.exam_content.findMany.mockResolvedValue([{ id: 'class-1' }, { id: 'class-2' }]);

      const result = await service.getExamContent('exam-1');

      expect(prisma.exam.findUnique).toHaveBeenCalledWith({ where: { id: 'exam-1' } });
      expect(prisma.exam_content.findMany).toHaveBeenCalledWith({
        where: { examId: 'exam-1' },
        orderBy: { created_at: 'desc' },
      });
      expect(result.statusCode).toBe(200);
      expect(result.message.content).toHaveLength(2);
    });

    it('throws NotFoundException when parent exam is missing (propagates)', async () => {
      prisma.exam.findUnique.mockResolvedValue(null);

      await expect(service.getExamContent('missing-exam')).rejects.toThrow(
        new NotFoundException('Exam missing-exam not found'),
      );
    });

    it('throws NotFoundException when content list is empty (propagates)', async () => {
      prisma.exam.findUnique.mockResolvedValue({ id: 'exam-1' });
      prisma.exam_content.findMany.mockResolvedValue([]);

      await expect(service.getExamContent('exam-1')).rejects.toThrow(
        new NotFoundException('No content found for exam exam-1'),
      );
    });
  });

  describe('getAllExamContent', () => {
    it('computes skip/take and orders by created_at desc', async () => {
      prisma.exam_content.findMany.mockResolvedValue([{ id: 'class-1' }]);
      prisma.exam_content.count.mockResolvedValue(7);

      const result = await service.getAllExamContent(2, 5);

      expect(prisma.exam_content.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
          orderBy: { created_at: 'desc' },
        }),
      );
      expect(prisma.exam_content.count).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 200,
        message: {
          content: [{ id: 'class-1' }],
          total: 7,
          page: 2,
          limit: 5,
        },
      });
    });

    it('returns empty content list when none exist', async () => {
      prisma.exam_content.findMany.mockResolvedValue([]);
      prisma.exam_content.count.mockResolvedValue(0);

      const result = await service.getAllExamContent(1, 10);

      expect(result.message.content).toEqual([]);
      expect(result.message.total).toBe(0);
    });
  });

  describe('getExamBySubject', () => {
    it('returns exams by subject including exam_content', async () => {
      prisma.subject.findUnique.mockResolvedValue({ id: 'subject-1', name: 'Math' });
      prisma.exam.findMany.mockResolvedValue([{ id: 'exam-1' }]);

      const result = await service.getExamBySubject('subject-1');

      expect(prisma.subject.findUnique).toHaveBeenCalledWith({ where: { id: 'subject-1' } });
      expect(prisma.exam.findMany).toHaveBeenCalledWith({
        where: { subject_id: 'subject-1' },
        include: { exam_content: true },
      });
      expect(result.statusCode).toBe(200);
      expect(result.message.subject).toEqual(expect.objectContaining({ id: 'subject-1' }));
      expect(result.message.exams).toEqual([{ id: 'exam-1' }]);
    });

    it('throws NotFoundException when subject is missing (propagates)', async () => {
      prisma.subject.findUnique.mockResolvedValue(null);

      await expect(service.getExamBySubject('missing-sub')).rejects.toThrow(
        new NotFoundException('Subject missing-sub not found'),
      );

      expect(prisma.exam.findMany).not.toHaveBeenCalled();
    });
  });

  describe('deleteExam', () => {
    it('deletes exam and cascades deletion of exam_content inside a transaction', async () => {
      prisma.exam.findUnique.mockResolvedValue({ id: 'exam-1' });
      prisma.$transaction.mockResolvedValue([{}, {}]);
      prisma.exam_content.deleteMany.mockResolvedValue({ count: 3 });
      prisma.exam.delete.mockResolvedValue({ id: 'exam-1' });

      const result = await service.deleteExam('exam-1');

      expect(prisma.exam.findUnique).toHaveBeenCalledWith({ where: { id: 'exam-1' } });
      expect(prisma.$transaction).toHaveBeenCalled();

      const txArg = prisma.$transaction.mock.calls[0][0];
      expect(Array.isArray(txArg)).toBe(true);
      expect(txArg.length).toBe(2);
      expect(result).toEqual({ statusCode: 200, message: { description: 'Exam deleted successfully' } });


      expect(prisma.exam_content.deleteMany).toHaveBeenCalledWith({ where: { examId: 'exam-1' } });
      expect(prisma.exam.delete).toHaveBeenCalledWith({ where: { id: 'exam-1' } });
    });

    it('throws NotFoundException when exam is missing (propagates)', async () => {
      prisma.exam.findUnique.mockResolvedValue(null);

      await expect(service.deleteExam('missing')).rejects.toThrow(
        new NotFoundException('Exam missing not found'),
      );

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.exam_content.deleteMany).not.toHaveBeenCalled();
      expect(prisma.exam.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateExam', () => {
    it('updates exam fields mapped from DTO conditionValue', async () => {
      prisma.exam.findUnique.mockResolvedValue({ id: 'exam-1' });
      prisma.exam.update.mockResolvedValue({
        id: 'exam-1',
        title: 'New title',
        duration: 50,
        media_type: 'url',
        media_value: 'http://new',
        subject_id: 'subject-1',
      });

      const result = await service.updateFullExam({
        conditionValue: 'exam-1',
        title: 'New title',
        duration: 50,
        media_type: 'url',
        media_value: 'http://new',
        subject_id: 'subject-1',
      } as any);

      expect(prisma.exam.findUnique).toHaveBeenCalledWith({ where: { id: 'exam-1' } });
      expect(prisma.exam.update).toHaveBeenCalledWith({
        where: { id: 'exam-1' },
        data: {
          title: 'New title',
          duration: 50,
          media_type: 'url',
          media_value: 'http://new',
          subject_id: 'subject-1',
        },
      });

      expect(result.statusCode).toBe(200);
      expect(result.message.description).toBe('Exam updated successfully');
      expect(result.message.exam).toEqual(expect.objectContaining({ id: 'exam-1' }));
    });

    it('throws NotFoundException when exam to update is missing (propagates)', async () => {
      prisma.exam.findUnique.mockResolvedValue(null);

      await expect(
        service.updateFullExam({
          conditionValue: 'missing',
          title: 'New',
          duration: 20,
          media_type: 'url',
          media_value: 'http://x',
          subject_id: 'subject-1',
        } as any),
      ).rejects.toThrow(new NotFoundException('Exam missing not found'));

      expect(prisma.exam.update).not.toHaveBeenCalled();
    });
  });
});

