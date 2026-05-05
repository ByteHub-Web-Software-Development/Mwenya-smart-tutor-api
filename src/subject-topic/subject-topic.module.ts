import { Module } from '@nestjs/common';
import { SubjectTopicController } from './subject-topic.controller';
import { SubjectTopicService } from './subject-topic.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubjectTopicController],
  providers: [SubjectTopicService],
  exports: [SubjectTopicService],
})
export class SubjectTopicModule {}
