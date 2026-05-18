import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Stats E2E (Admin)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  jest.setTimeout(1000000);

  // Admin: role id must be '4' (see StatsController @Roles('4'))
  const adminDeviceId = 'android-admin-1';
  const adminMsisdn = '260971111111';
  const adminPin = '1234';
  const adminUserName = 'Admin User';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    const role = await prisma.user_Role.upsert({
      where: { id: '4' },
      update: { name: 'Admin' },
      create: { id: '4', name: 'Admin' },
    });

    const status = await prisma.user_Status.upsert({
      where: { id: '1' },
      update: { name: 'Active' },
      create: { id: '1', name: 'Active' },
    });

    const passwordHash = await bcrypt.hash(adminPin, 10);

    const existingUser = await prisma.user_Details.findFirst({
      where: { msisdn: adminMsisdn },
      select: { id: true },
    });

    if (existingUser?.id) {
      await prisma.user_Details.update({
        where: { id: existingUser.id },
        data: {
          device_id: 'old-admin-device',
          password: passwordHash,
          user_name: adminUserName,
          user_role: role.id,
          user_status: status.id,
          referral_code: null,
        },
      });
    } else {
      await prisma.user_Details.create({
        data: {
          created_at: new Date(),
          device_id: adminDeviceId,
          msisdn: adminMsisdn,
          password: passwordHash,
          updated_at: new Date(),
          user_name: adminUserName,
          user_role: role.id,
          user_status: status.id,
          referral_code: null,
        },
      });
    }
  });

  afterAll(async () => {
    await prisma.sessions.deleteMany();
    await prisma.user_Details.deleteMany({ where: { msisdn: adminMsisdn } });
    await app.close();
  });

  const getAdminJwt = async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ msisdn: adminMsisdn, pin: adminPin, device_id: adminDeviceId })
      .expect(201);

    expect(loginResponse.body.jwtToken).toBeDefined();
    expect(typeof loginResponse.body.jwtToken).toBe('string');

    return loginResponse.body.jwtToken as string;
  };

  describe('GET /stats/admin/total-stats', () => {
    it('should reject without admin JWT', async () => {
      await request(app.getHttpServer())
        .get('/stats/admin/total-stats')
        .expect(401);
    });

    it('should return total stats with admin JWT', async () => {
      const jwtToken = await getAdminJwt();

      const response = await request(app.getHttpServer())
        .get('/stats/admin/total-stats')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      // Response interceptor wraps unless handler returned statusCode/message/data
      // StatsService returns { statusCode, message: {...} }
      // ResponseInterceptor detects {statusCode} and preserves it.
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBeDefined();

      expect(response.body.message.totalUsers).toBeDefined();
      expect(response.body.message.totalSubscriptions).toBeDefined();
      expect(response.body.message.activeUsers).toBeDefined();
      expect(response.body.message.revenueTotal).toBeDefined();

      expect(typeof response.body.message.totalUsers).toBe('number');
      expect(typeof response.body.message.totalSubscriptions).toBe('number');
      expect(typeof response.body.message.activeUsers).toBe('number');
      expect(typeof response.body.message.revenueTotal).toBe('number');
    });
  });
});

