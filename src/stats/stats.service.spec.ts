import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StatsService', () => {
  let service: StatsService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      user_Details: {
        findMany: jest.fn(),
      },
      subscriptions: {
        aggregate: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('should correctly attribute student subscriptions to the teacher code', async () => {
    // Mock the Teachers who own referral codes
    prismaMock.user_Details.findMany.mockResolvedValue([
      {
        msisdn: '260978200000',
        referral_code: 'TEACH_01',
        user_name: 'Mr. Zulu',
      },
    ]);

    // Mock the Aggregation for subscriptions revenue & conversions
    prismaMock.subscriptions.aggregate.mockResolvedValue({
      _sum: { amount: 500 },
      _count: { _all: 5 },
    });

    const result = await service.getTeacherReferralSubscriptions();
    const data = result.message.teacherReferrals[0];

    expect(data.code).toBe('TEACH_01');
    expect(data.totalRevenue).toBe(500);
    expect(data.totalStudents).toBe(5);
  });
});

