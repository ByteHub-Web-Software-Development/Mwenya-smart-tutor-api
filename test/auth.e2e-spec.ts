import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  jest.setTimeout(1000000);

  // Use exact values from auth.service.spec.ts
  const deviceId = 'appleiPhone-1';
  const msisdn = '260971234567';
  const pin = '1234';
  const userName = 'Mwenya Mutengo';



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

    // Upsert with a guaranteed unique selector (id).
    if (existingUser?.id) {
      await prisma.user_Details.update({
        where: { id: existingUser.id },
        data: {
          device_id: 'old-device',
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
    await prisma.sessions.deleteMany();
    await prisma.user_Details.deleteMany({ where: { msisdn } });
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should login successfully and return jwtToken', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ msisdn, pin, device_id: deviceId })
        .expect(201);


      expect(response.body.description).toBe('Login successful');
      expect(response.body.jwtToken).toBeDefined();
      expect(typeof response.body.jwtToken).toBe('string');
      expect(response.body.user_details).toBeDefined();
      expect(response.body.user_details.msisdn).toBe(msisdn);
    });

    it('should fail with 400 for invalid credentials (wrong pin)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ msisdn, pin: '0000', device_id: deviceId })
        .expect(400);
    });
  });
});

