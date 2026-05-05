import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddExamDto } from './dto/add-exam.dto';
import { AddExamContentDto } from './dto/add-exam-content.dto';
import { UpdateExamFieldDto } from './dto/update-exam-field.dto';
import { randomUUID } from 'crypto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { UpdateFullExamDto } from './dto/update-full-exam.dto';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async addExam(exam: AddExamDto) {
    // Validate subject exists before inserting
    const subject = await this.prisma.subject.findUnique({ where: { id: exam.subject } });
    if (!subject) throw new NotFoundException(`Subject ${exam.subject} not found`);

    const examId = randomUUID();
    const created = await this.prisma.exam.create({
      data: {
        id: examId,
        title: exam.title,
        duration: exam.duration,
        media_type: exam.media_type,
        media_value: exam.media_value,
        year: exam.year,
        subject_id: exam.subject,
      },
    });

    return { statusCode: 201, message: { description: 'Exam added successfully', exam: created } };
  }

  async getExam(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: { exam_content: true, subject: true },
    });
    if (!exam) throw new NotFoundException(`Exam ${id} not found`);
    return { statusCode: 200, message: { exam } };
  }

  async getAllExams(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [exams, total] = await Promise.all([
      this.prisma.exam.findMany({
        skip,
        take: limit,
        include: { exam_content: true },
        orderBy: { year: 'desc' },
      }),
      this.prisma.exam.count(),
    ]);
    return { statusCode: 200, message: { exams, total, page, limit } };
  }

  async addExamContent(examContent: AddExamContentDto) {
    // Validate parent exam exists
    const exam = await this.prisma.exam.findUnique({ where: { id: examContent.exam } });
    if (!exam) throw new NotFoundException(`Exam ${examContent.exam} not found`);

    const content = await this.prisma.exam_content.create({
      data: {
        examId: examContent.exam,
        examType: examContent.exam_type,
        examLink: examContent.exam_link,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return { statusCode: 201, message: { description: 'Exam content added successfully', content } };
  }

  async getExamContent(examId: string) {
    const content = await this.prisma.exam_content.findMany({
      where: { examId },
      orderBy: { created_at: 'desc' },
    });
    if (!content.length) throw new NotFoundException(`No content found for exam ${examId}`);
    return { statusCode: 200, message: { content } };
  }

  async getAllExamContent(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [content, total] = await Promise.all([
      this.prisma.exam_content.findMany({ skip, take: limit, orderBy: { created_at: 'desc' } }),
      this.prisma.exam_content.count(),
    ]);
    return { statusCode: 200, message: { content, total, page, limit } };
  }

  async getExamBySubject(subjectId: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new NotFoundException(`Subject ${subjectId} not found`);

    const exams = await this.prisma.exam.findMany({
      where: { subject_id: subjectId },
      include: { exam_content: true },
    });
    return { statusCode: 200, message: { exams } };
  }

  async deleteExam(id: string) {
    // Check if exam exists first to provide specific NotFound
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException(`Exam ${id} not found`);

    // Cascade delete content first in a transaction
    await this.prisma.$transaction([
      this.prisma.exam_content.deleteMany({ where: { examId: id } }),
      this.prisma.exam.delete({ where: { id } }),
    ]);
    return { statusCode: 200, message: { description: 'Exam deleted successfully' } };
  }

  async updateFullExam(updateData: UpdateFullExamDto) {
    const exam = await this.prisma.exam.findUnique({ where: { id: updateData.conditionValue } });
    if (!exam) throw new NotFoundException(`Exam ${updateData.conditionValue} not found`);

    const updated = await this.prisma.exam.update({
      where: { id: updateData.conditionValue },
      data: {
        title: updateData.title,
        duration: updateData.duration,
        media_type: updateData.media_type,
        media_value: updateData.media_value,
        subject_id: updateData.subject_id,
      },
    });
    return { statusCode: 200, message: { description: 'Exam updated successfully', exam: updated } };
  }
}
