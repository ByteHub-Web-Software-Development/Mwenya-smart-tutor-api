import { Test, TestingModule } from '@nestjs/testing';
import { SubjectTopicController } from './subject-topic.controller';
import { SubjectTopicService } from './subject-topic.service';
import { SubjectTopicModule } from './subject-topic.module';

describe('SubjectTopicController', () => {
  let controller: SubjectTopicController;
  let mockSubjectTopicService: Partial<SubjectTopicService>;

  beforeEach(async () => {
    mockSubjectTopicService = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectTopicController],
      providers: [
        {
          provide: SubjectTopicService,
          useValue: mockSubjectTopicService,
        },
      ],
    }).compile();

    controller = module.get<SubjectTopicController>(SubjectTopicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
