import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSubjects() {
    const subjects = await this.prisma.subject.findMany({
      include: { subject_topics: true },
    });
    return { statusCode: 200, message: { subjects } };
  }

  async getSubjectById(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: { subject_topics: true, exams: true, lessons: true },
    });
    if (!subject) throw new NotFoundException(`Subject ${id} not found`);
    return { statusCode: 200, message: { subject } };
  }

  async createSubject(dto: CreateSubjectDto) {
    const subject = await this.prisma.subject.create({
      data: { id: randomUUID(), ...dto },
    });
    return { statusCode: 201, message: { description: 'Subject created successfully', subject } };
  }

  async updateSubject(id: string, dto: UpdateSubjectDto | CreateSubjectDto) {
    const subjectExists = await this.prisma.subject.findUnique({ where: { id } });
    if (!subjectExists) throw new NotFoundException(`Subject ${id} not found`);

    const subject = await this.prisma.subject.update({
      where: { id },
      data: dto,
    });
    return { statusCode: 200, message: { description: 'Subject updated', subject } };
  }

  async deleteSubject(id: string) {
    const subjectExists = await this.prisma.subject.findUnique({ where: { id } });
    if (!subjectExists) throw new NotFoundException(`Subject ${id} not found`);

    const [examCount, lessonCount] = await Promise.all([
      this.prisma.exam.count({ where: { subject_id: id } }),
      this.prisma.lessons.count({ where: { subject_id: id } }),
    ]);

    if (examCount > 0 || lessonCount > 0) {
      throw new ConflictException(
        `Cannot delete subject — it has ${examCount} exam(s) and ${lessonCount} lesson(s) attached. Remove them first.`,
      );
    }

    await this.prisma.subject.delete({ where: { id } });
    return { statusCode: 200, message: { description: 'Subject deleted successfully' } };
  }
}
