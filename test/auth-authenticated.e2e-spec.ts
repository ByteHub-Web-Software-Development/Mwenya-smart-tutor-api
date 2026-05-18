import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Auth E2E › GET /auth/authenticated', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  jest.setTimeout(1000000);

  // Student (role id 1)
  const deviceId = 'appleiPhone-auth-1';
  const msisdn = '260971234568';
  const pin = '1234';
  const userName = 'Auth Authed User';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    const role = await prisma.user_Role.upsert({
      where: { id: '1' },
      update: { name: 'Student' },
      create: { id: '1', name: 'Student' },
    });

    const status = await prisma.user_Status.upsert({
      where: { id: '1' },
      update: { name: 'Active' },
      create: { id: '1', name: 'Active' },
    });

    const passwordHash = await bcrypt.hash(pin, 10);

    const existingUser = await prisma.user_Details.findFirst({
      where: { msisdn },
      select: { id: true },
    });

    if (existingUser?.id) {
      await prisma.user_Details.update({
        where: { id: existingUser.id },
        data: {
          device_id: 'old-device-auth',
          password: passwordHash,
          user_name: userName,
          user_role: role.id,
          user_status: status.id,
          referral_code: null,
        },
      });
    } else {
      await prisma.user_Details.create({
        data: {
          created_at: new Date(),
          device_id: deviceId,
          msisdn,
          password: passwordHash,
          updated_at: new Date(),
          user_name: userName,
          user_role: role.id,
          user_status: status.id,
          referral_code: null,
        },
      });
    }
  });

  afterAll(async () => {
    // Clean up sessions + user
    await prisma.sessions.deleteMany();
    await prisma.user_Details.deleteMany({ where: { msisdn } });
    await app.close();
  });

  describe('GET /auth/authenticated', () => {
    it('should return isAuthenticated=true when an active session exists', async () => {
      // session id is `${user_name}-${device_id}`
      await prisma.sessions.upsert({
        where: { id: `${userName}-${deviceId}` },
        update: { is_valid: '1', device_id: deviceId, updated_at: new Date() },
        create: {
          id: `${userName}-${deviceId}`,
          user_name: userName,
          device_id: deviceId,
          is_valid: '1',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      const response = await request(app.getHttpServer())
        .get('/auth/authenticated')
        .set('user_name', userName)
        .set('device_id', deviceId)
        .expect(200);

      expect(response.body.data.isAuthenticated).toBe(true);
      expect(response.body.data.description).toBe('User is authenticated');
    });

    it('should return isAuthenticated=false when session is invalid', async () => {
      await prisma.sessions.upsert({
        where: { id: `${userName}-${deviceId}` },
        update: { is_valid: '0', device_id: deviceId, updated_at: new Date() },
        create: {
          id: `${userName}-${deviceId}`,
          user_name: userName,
          device_id: deviceId,
          is_valid: '0',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      const response = await request(app.getHttpServer())
        .get('/auth/authenticated')
        .set('user_name', userName)
        .set('device_id', deviceId)
        .expect(200);

      expect(response.body.data.isAuthenticated).toBe(false);
      expect(response.body.data.description).toBe('Session not found or expired');
    });

    it('should return 400 when headers are missing', async () => {
      await request(app.getHttpServer())
        .get('/auth/authenticated')
        .expect(400);
    });
  });
});
