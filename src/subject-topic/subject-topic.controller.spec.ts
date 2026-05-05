import { Test, TestingModule } from '@nestjs/testing';
import { SubjectTopicController } from './subject-topic.controller';

describe('SubjectTopicController', () => {
  let controller: SubjectTopicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectTopicController],
    }).compile();

    controller = module.get<SubjectTopicController>(SubjectTopicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
