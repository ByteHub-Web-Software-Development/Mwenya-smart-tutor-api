import { Test, TestingModule } from '@nestjs/testing';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';

// Prevent Jest from trying to parse ESM-only dependency during unit tests
jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(() => 'test-id'),
}));



describe('ExamsController', () => {
  let controller: ExamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamsController],
      providers: [
        {
          provide: ExamsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ExamsController>(ExamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

