import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  let controller: ChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot({ throttlerModuleOptions: { ttl: 60, limit: 10 } } as any),
      ],
      controllers: [ChatController],
      providers: [ChatService],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
