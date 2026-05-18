import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from './subjects.service';
import { SubjectsModule } from './subjects.module';

describe('SubjectsService', () => {
  let service: SubjectsService;
  

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SubjectsModule],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
