import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddLessonDto } from './dto/add-lesson.dto';
import { UpdateFullLessonDto } from './dto/update-full-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllLessons(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [lessons, total] = await Promise.all([
      this.prisma.lessons.findMany({
        skip,
        take: limit,
        include: { lesson_content: true },
        orderBy: { title: 'asc' },
      }),
      this.prisma.lessons.count(),
    ]);
    return { statusCode: 200, message: { lessons, total, page, limit } };
  }

  async getLesson(id: string) {
    const lesson = await this.prisma.lessons.findUnique({
      where: { id },
      include: { lesson_content: true, subject: true },
    });
    if (!lesson) throw new NotFoundException(`Lesson ${id} not found`);
    return { statusCode: 200, message: { lesson } };
  }

  async addLesson(lesson: AddLessonDto) {
    // Validate subject exists
    const subject = await this.prisma.subject.findUnique({ where: { id: lesson.subject_id } });
    if (!subject) throw new NotFoundException(`Subject ${lesson.subject_id} not found`);

    const created = await this.prisma.lessons.create({
      data: { id: randomUUID(), ...lesson },
    });

    return { statusCode: 201, message: { description: 'Lesson added successfully', lesson: created } };
  }

  async getLessonBySubject(subjectId: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new NotFoundException(`Subject ${subjectId} not found`);

    const lessons = await this.prisma.lessons.findMany({
      where: { subject_id: subjectId },
      include: { lesson_content: true },
    });

    return { statusCode: 200, message: { lessons } };
  }

  async deleteLesson(id: string) {
    const lesson = await this.prisma.lessons.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException(`Lesson ${id} not found`);

    await this.prisma.$transaction([
      this.prisma.lesson_Content.deleteMany({ where: { lesson_id: id } }),
      this.prisma.lessons.delete({ where: { id } }),
    ]);

    return { statusCode: 200, message: { description: 'Lesson deleted successfully' } };
  }

  async updateLesson(updateData: UpdateLessonDto & { conditionValue: string }) {
    const lesson = await this.prisma.lessons.findUnique({ where: { id: updateData.conditionValue } });
    if (!lesson) throw new NotFoundException(`Lesson ${updateData.conditionValue} not found`);

    // Only allow updating known, safe columns to prevent injection
    const allowedColumns = ['title', 'duration', 'media_type', 'media_value', 'subject_id'];
    if (!allowedColumns.includes(updateData.column)) {
      throw new Error(`Column '${updateData.column}' is not updatable`);
    }

    const updated = await this.prisma.lessons.update({
      where: { id: updateData.conditionValue },
      data: { [updateData.column]: updateData.updateValue },
    });

    return { statusCode: 200, message: { description: 'Lesson updated successfully', lesson: updated } };
  }

  async updateFullLesson(updateData: UpdateFullLessonDto & { conditionValue: string }) {
    const lesson = await this.prisma.lessons.findUnique({ where: { id: updateData.conditionValue } });
    if (!lesson) throw new NotFoundException(`Lesson ${updateData.conditionValue} not found`);

    // Remove unused condition fields
    const { conditionValue, condition: _condition, ...data } = updateData;

    const updated = await this.prisma.lessons.update({
      where: { id: conditionValue },
      data,
    });

    return { statusCode: 200, message: { description: 'Lesson updated successfully', lesson: updated } };
  }
}

