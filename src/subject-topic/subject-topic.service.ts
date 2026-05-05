import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto, UpdateTopicDto } from './dto/create-topic.dto';

@Injectable()
export class SubjectTopicService {
  constructor(private readonly prisma: PrismaService) {}

  async getTopicsBySubject(subjectId: string) {
    const topics = await this.prisma.subject_Topic.findMany({
      where: { subject: subjectId },
      orderBy: { title: 'asc' },
    });
    return { statusCode: 200, message: { topics } };
  }

  async createTopic(dto: CreateTopicDto) {
    // Validate parent subject exists
    const subject = await this.prisma.subject.findUnique({ where: { id: dto.subject } });
    if (!subject) throw new NotFoundException(`Subject ${dto.subject} not found`);

    const topic = await this.prisma.subject_Topic.create({
      data: { subject: dto.subject, title: dto.title },
    });
    return { statusCode: 201, message: { description: 'Topic created successfully', topic } };
  }

  async updateTopic(id: string, dto: UpdateTopicDto) {
    const topicExists = await this.prisma.subject_Topic.findUnique({ where: { id } });
    if (!topicExists) throw new NotFoundException(`Topic ${id} not found`);

    const topic = await this.prisma.subject_Topic.update({
      where: { id },
      data: dto,
    });
    return { statusCode: 200, message: { description: 'Topic updated', topic } };
  }

  async deleteTopic(id: string) {
    const topicExists = await this.prisma.subject_Topic.findUnique({ where: { id } });
    if (!topicExists) throw new NotFoundException(`Topic ${id} not found`);

    await this.prisma.subject_Topic.delete({ where: { id } });
    return { statusCode: 200, message: { description: 'Topic deleted successfully' } };
  }
}
