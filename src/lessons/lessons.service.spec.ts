import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from './lessons.service';
import { PrismaService } from '../prisma/prisma.service';


describe('LessonsService', () => {
  let service: LessonsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      lessons: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      lesson_Content: {
        deleteMany: jest.fn(),
      },
      subject: {
        findUnique: jest.fn(),
      },
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllLessons', () => {
    it('returns lessons + pagination metadata', async () => {
      prisma.lessons.findMany.mockResolvedValue([{ id: 'Lesson1' }, { id: 'Lesson2' }]);
      prisma.lessons.count.mockResolvedValue(2);

      const res = await service.getAllLessons(2, 20);

      expect(prisma.lessons.findMany).toHaveBeenCalledWith({
        skip: 20,
        take: 20,
        include: { lesson_content: true },
        orderBy: { title: 'asc' },
      });
      expect(prisma.lessons.count).toHaveBeenCalled();
      expect(res).toEqual({ statusCode: 200, message: { lessons: [{ id: 'Lesson1' }, { id: 'Lesson2' }], total: 2, page: 2, limit: 20 } });
    });
  });

  describe('getLesson', () => {
    it('returns a lesson when found', async () => {
      prisma.lessons.findUnique.mockResolvedValue({
        id: 'Lesson1',
        title: 'T',
        lesson_content: [{ id: 'class1' }],
        subject: { id: 'subject0' },
      });

      const res = await service.getLesson('Lesson1');

      expect(prisma.lessons.findUnique).toHaveBeenCalledWith({
        where: { id: 'Lesson1' },
        include: { lesson_content: true, subject: true },
      });
      expect(res).toEqual({ statusCode: 200, message: { lesson: expect.any(Object) } });
    });

    it('throws NotFoundException when lesson does not exist', async () => {
      prisma.lessons.findUnique.mockResolvedValue(null);

      await expect(service.getLesson('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('addLesson', () => {
    it('throws NotFoundException when subject does not exist', async () => {
      prisma.subject.findUnique.mockResolvedValue(null);

      await expect(
        service.addLesson({
          title: 'Lesson',
          duration: '45m',
          media_type: 'video',
          media_value: 'http://x',
          subject_id: 'sub-missing',
        })
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.lessons.create).not.toHaveBeenCalled();
    });

    it('creates lesson when subject exists', async () => {
      prisma.subject.findUnique.mockResolvedValue({ id: 'subject0' });
      prisma.lessons.create.mockResolvedValue({ id: 'new-lesson', title: 'Lesson' });

      const dto = {
        title: 'Lesson',
        duration: '45m',
        media_type: 'video',
        media_value: 'http://x',
        subject_id: 'subject0',
      };

      const res = await service.addLesson(dto);

      expect(prisma.subject.findUnique).toHaveBeenCalledWith({ where: { id: 'subject0' } });
      expect(prisma.lessons.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: expect.any(String),
          title: 'Lesson',
          duration: '45m',
          media_type: 'video',
          media_value: 'http://x',
          subject_id: 'subject0',
        }),
      });

      expect(res).toEqual({
        statusCode: 201,
        message: { description: 'Lesson added successfully', lesson: { id: 'new-lesson', title: 'Lesson' } },
      });
    });
  });

  describe('getLessonBySubject', () => {
    it('throws NotFoundException when subject does not exist', async () => {
      prisma.subject.findUnique.mockResolvedValue(null);

      await expect(service.getLessonBySubject('sub-missing')).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.lessons.findMany).not.toHaveBeenCalled();
    });

    it('returns lessons for subject when subject exists', async () => {
      prisma.subject.findUnique.mockResolvedValue({ id: 'subject0' });
      prisma.lessons.findMany.mockResolvedValue([{ id: 'Lesson1' }]);

      const res = await service.getLessonBySubject('subject0');

      expect(prisma.lessons.findMany).toHaveBeenCalledWith({
        where: { subject_id: 'subject0' },
        include: { lesson_content: true },
      });
      expect(res).toEqual({ statusCode: 200, message: { lessons: [{ id: 'Lesson1' }] } });
    });
  });

  describe('deleteLesson', () => {
    it('throws NotFoundException when lesson does not exist', async () => {
      prisma.lessons.findUnique.mockResolvedValue(null);

      await expect(service.deleteLesson('missing')).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.lesson_Content.deleteMany).not.toHaveBeenCalled();
      expect(prisma.lessons.delete).not.toHaveBeenCalled();
    });

    it('deletes lesson content and lesson when lesson exists', async () => {
      prisma.lessons.findUnique.mockResolvedValue({ id: 'Lesson1' });
      prisma.lesson_Content.deleteMany.mockResolvedValue({ count: 2 });
      prisma.lessons.delete.mockResolvedValue({ id: 'Lesson1' });
      prisma.$transaction = jest.fn(async (actions: any[]) => {
        // emulate executing both actions sequentially
        return Promise.all(actions.map((a) => (typeof a === 'function' ? a() : a)));
      });

      const res = await service.deleteLesson('Lesson1');

      expect(prisma.lesson_Content.deleteMany).toHaveBeenCalledWith({ where: { lesson_id: 'Lesson1' } });
      expect(prisma.lessons.delete).toHaveBeenCalledWith({ where: { id: 'Lesson1' } });
      expect(res).toEqual({ statusCode: 200, message: { description: 'Lesson deleted successfully' } });
    });
  });

  describe('updateLesson', () => {
    it('throws NotFoundException when lesson does not exist', async () => {
      prisma.lessons.findUnique.mockResolvedValue(null);

      await expect(
        service.updateLesson({
          conditionValue: 'missing',
          column: 'title',
          updateValue: 'New',
          condition: 'condition',
        } as any)
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.lessons.update).not.toHaveBeenCalled();
    });

    it('throws Error when column is not allowed', async () => {
      prisma.lessons.findUnique.mockResolvedValue({ id: 'Lesson1' });

      await expect(
        service.updateLesson({
          conditionValue: 'Lesson1',
          column: 'not_allowed',
          updateValue: 'New',
          condition: 'condition',
        } as any)
      ).rejects.toThrow("Column 'not_allowed' is not updatable");

      expect(prisma.lessons.update).not.toHaveBeenCalled();
    });

    it('updates allowed column', async () => {
      prisma.lessons.findUnique.mockResolvedValue({ id: 'Lesson1' });
      prisma.lessons.update.mockResolvedValue({ id: 'Lesson1', title: 'New' });

      const res = await service.updateLesson({
        conditionValue: 'Lesson1',
        column: 'title',
        updateValue: 'New',
        condition: 'condition',
      } as any);

      expect(prisma.lessons.update).toHaveBeenCalledWith({
        where: { id: 'Lesson1' },
        data: { title: 'New' },
      });

      expect(res).toEqual({
        statusCode: 200,
        message: { description: 'Lesson updated successfully', lesson: { id: 'Lesson1', title: 'New' } },
      });
    });
  });

  describe('updateFullLesson', () => {
    it('throws NotFoundException when lesson does not exist', async () => {
      prisma.lessons.findUnique.mockResolvedValue(null);

      await expect(
        service.updateFullLesson({
          conditionValue: 'missing',
          condition: 'condition',
          title: 'Title2',
          duration: '30m',
          media_type: 'video',
          media_value: 'http://x',
          subject_id: 'subject0',
        } as any)
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.lessons.update).not.toHaveBeenCalled();
    });

    it('updates full lesson and passes through only data fields (excluding conditionValue/condition)', async () => {
      prisma.lessons.findUnique.mockResolvedValue({ id: 'Lesson1' });
      prisma.lessons.update.mockResolvedValue({ id: 'Lesson1', title: 'Title2' });

      const res = await service.updateFullLesson({
        conditionValue: 'Lesson1',
        condition: 'condition',
        title: 'Title2',
        duration: '30m',
        media_type: 'video',
        media_value: 'http://x',
        subject_id: 'subject0',
      } as any);

      expect(prisma.lessons.update).toHaveBeenCalledWith({
        where: { id: 'Lesson1' },
        data: {
          title: 'Title2',
          duration: '30m',
          media_type: 'video',
          media_value: 'http://x',
          subject_id: 'subject0',
        },
      });

      expect(res).toEqual({
        statusCode: 200,
        message: { description: 'Lesson updated successfully', lesson: { id: 'Lesson1', title: 'Title2' } },
      });
    });
  });
});

