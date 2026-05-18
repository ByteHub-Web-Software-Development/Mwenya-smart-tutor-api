import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { SubjectsModule } from './subjects.module';

describe('SubjectsController', () => {
  let controller: SubjectsController;
   const mockSubjectsService = {};
    

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SubjectsModule],
      controllers: [SubjectsController],
      providers: [{ provide: SubjectsService, useValue: mockSubjectsService }],
    }).compile();

    controller = module.get<SubjectsController>(SubjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
