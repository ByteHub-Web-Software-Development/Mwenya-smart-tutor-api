import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';


describe('Exams Lifecycle (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testSubjectId: string;
  let testExamId: string;

  // Admin user for authenticated requests
  const adminDeviceId = 'android-admin-exams-e2e';
  const adminMsisdn = '260971111112'; // Unique MSISDN for this test suite
  const adminPin = '1234';
  const adminUserName = 'Exams Admin User';
  let adminJwtToken: string;

  jest.setTimeout(1000000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Seed a Subject as Exams require a valid subject_id
    const subject = await prisma.subject.create({
      data: {
        name: 'Science',
        exam_title: 'End of Year Science',
        exam_description: 'General Science for Grade 9',
        lesson_title: 'The Solar System',
        lesson_description: 'Planets and Stars',
        pictureURL: 'https://bytehub.zm/science.png',
      },
    });
    testSubjectId = subject.id;

    // Setup Admin User for authenticated requests
    const adminRole = await prisma.user_Role.upsert({
      where: { id: '4' },
      update: { name: 'Admin' },
      create: { id: '4', name: 'Admin' },
    });

    const adminStatus = await prisma.user_Status.upsert({
      where: { id: '1' },
      update: { name: 'Active' },
      create: { id: '1', name: 'Active' },
    });

    const adminPasswordHash = await bcrypt.hash(adminPin, 10);

    const existingAdminUser = await prisma.user_Details.findFirst({
      where: { msisdn: adminMsisdn },
      select: { id: true },
    });

    if (existingAdminUser?.id) {
      await prisma.user_Details.update({
        where: { id: existingAdminUser.id },
        data: {
          device_id: adminDeviceId,
          password: adminPasswordHash,
          user_name: adminUserName,
          user_role: adminRole.id,
          user_status: adminStatus.id,
          referral_code: null,
        },
      });
    } else {
      await prisma.user_Details.create({
        data: {
          created_at: new Date(),
          device_id: adminDeviceId,
          msisdn: adminMsisdn,
          password: adminPasswordHash,
          updated_at: new Date(),
          user_name: adminUserName,
          user_role: adminRole.id,
          user_status: adminStatus.id,
          referral_code: null,
        },
      });
    }

    // Login admin user to get JWT
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ msisdn: adminMsisdn, pin: adminPin, device_id: adminDeviceId })
      .expect(201);
    adminJwtToken = loginResponse.body.jwtToken;
  });

  afterAll(async () => {
    // Clean up database to prevent side effects in future test runs
    await prisma.sessions.deleteMany({ where: { user_name: adminUserName } });
    await prisma.user_Details.deleteMany({ where: { msisdn: adminMsisdn } });
    await prisma.exam_content.deleteMany();
    await prisma.exam.deleteMany();
    await prisma.subject.deleteMany();
    await app.close();
  });

  describe('Security (Authentication)', () => {
    it('should return 401 Unauthorized when no token is provided (GET /exams)', async () => {
      await request(app.getHttpServer())
        .get('/exams')
        .expect(401);
    });

    it('should return 401 Unauthorized when no token is provided (POST /exams)', async () => {
      await request(app.getHttpServer())
        .post('/exams')
        .expect(401);
    });
  });

  // --- 1. CREATE ---
  describe('POST /exams', () => {
    it('should successfully create a new exam with a CUID', async () => {
      const payload = {
        title: 'Biology Paper 1',
        duration: '1h 30m',
        media_type: 'PDF',
        media_value: 'https://cdn.bytehub.zm/bio-p1.pdf',
        year: '2026',
        subject: testSubjectId,
      };

      const response = await request(app.getHttpServer())
        .post('/exams')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send(payload)
        .expect(201);

      expect(response.body.message.exam).toBeDefined();
      expect(response.body.message.exam.id).toMatch(/^[a-z0-9]{24}$/); // Validates CUID2 format
      expect(response.body.message.exam.title).toBe(payload.title);
      expect(response.body.message.exam.duration).toBe(payload.duration);
      expect(response.body.message.exam.year).toBe(payload.year);
      testExamId = response.body.message.exam.id;
    });

    it('should create exam with minimal required fields', async () => {
      const payload = {
        title: 'Chemistry Test',
        duration: '2h',
        media_type: 'PDF',
        media_value: 'https://example.com/chem.pdf',
        year: '2025',
        subject: testSubjectId,
      };

      const response = await request(app.getHttpServer())
        .post('/exams')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send(payload)
        .expect(201);

      expect(response.body.message.exam.id).toMatch(/^[a-z0-9]{24}$/);
      expect(response.body.message.exam.title).toBe(payload.title);
    });

    it('should fail if title is missing', async () => {
      const payload = {
        duration: '2h',
        subject: testSubjectId,
      };

      await request(app.getHttpServer())
        .post('/exams')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send(payload)
        .expect(400);
    });

    it('should fail if subject_id is invalid', async () => {
      const payload = {
        title: 'Invalid Subject Exam',
        duration: '1h',
        media_type: 'PDF',
        media_value: 'https://example.com/invalid.pdf',
        year: '2025',
        subject: 'non-existent-id',
      };

      await request(app.getHttpServer())
        .post('/exams')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send(payload)
        .expect(404);
    });

    it('should fail if subject_id is missing', async () => {
      const payload = {
        title: 'Missing Subject Exam',
        duration: '1h',
        media_type: 'PDF',
        media_value: 'https://example.com/missing.pdf',
        year: '2025',
      };

      await request(app.getHttpServer())
        .post('/exams')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send(payload)
        .expect(400);
    });
  });

  // --- 2. READ ---
  describe('GET /exams/:id', () => {
    it('should retrieve the exam details including content array', async () => {
      const response = await request(app.getHttpServer())
        .get(`/exams/${testExamId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(200);

      expect(response.body.message.exam.id).toBe(testExamId);
      expect(response.body.message.exam.exam_content).toBeInstanceOf(Array);
      expect(response.body.message.exam.title).toBeDefined();
    });

    it('should return 404 for non-existent exam', async () => {
      await request(app.getHttpServer())
        .get('/exams/non-existent-exam-id')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(404);
    });

    it('should retrieve multiple exams via GET /exams', async () => {
      const response = await request(app.getHttpServer())
        .get('/exams')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body.message.exams)).toBe(true);
      expect(response.body.message.exams.length).toBeGreaterThan(0);
      expect(response.body.message.exams[0].id).toBeDefined();
    });

    it('should support pagination on GET /exams', async () => {
      const response = await request(app.getHttpServer())
        .get('/exams?page=1&limit=10')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body.message.exams)).toBe(true);
      expect(response.body.message.pagination).toBeDefined();
      expect(response.body.message.pagination.currentPage).toBe(1);
      expect(response.body.message.pagination.pageSize).toBeLessThanOrEqual(10);
    });
  });

  // --- 3. UPDATE ---
  describe('PATCH /exams/:id', () => {
    let updateTestExamId: string;

    beforeAll(async () => {
      // Create an exam specifically for update testing
      const payload = {
        title: 'Physics Paper',
        duration: '2h',
        media_type: 'PDF',
        media_value: 'https://example.com/physics.pdf',
        year: '2026',
        subject: testSubjectId,
      };

      const response = await request(app.getHttpServer())
        .post('/exams')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send(payload)
        .expect(201);

      updateTestExamId = response.body.message.exam.id;
    });

    it('should successfully update exam fields', async () => {
      const updatePayload = {
        title: 'Physics Paper - Updated',
        duration: '2h 30m',
      };

      const response = await request(app.getHttpServer())
        .patch(`/exams/${updateTestExamId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send(updatePayload)
        .expect(200);

      expect(response.body.message.exam.title).toBe(updatePayload.title);
      expect(response.body.message.exam.duration).toBe(updatePayload.duration);
    });

    it('should partially update only specified fields', async () => {
      const updatePayload = {
        year: '2027',
      };

      const response = await request(app.getHttpServer())
        .patch(`/exams/${updateTestExamId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send(updatePayload)
        .expect(200);

      expect(response.body.message.exam.year).toBe(updatePayload.year);
      // Verify other fields remain unchanged
      expect(response.body.message.exam.title).toBe('Physics Paper - Updated');
    });

    it('should return 404 when updating non-existent exam', async () => {
      await request(app.getHttpServer())
        .patch('/exams/non-existent-id')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  // --- 4. DELETE ---
  describe('DELETE /exams/:id', () => {
    let deleteTestExamId: string;

    beforeAll(async () => {
      // Create an exam specifically for deletion testing
      const payload = {
        title: 'Exam to Delete',
        duration: '1h',
        media_type: 'PDF',
        media_value: 'https://example.com/delete.pdf',
        year: '2025',
        subject: testSubjectId,
      };

      const response = await request(app.getHttpServer())
        .post('/exams')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send(payload)
        .expect(201);

      deleteTestExamId = response.body.message.exam.id;
    });

    it('should delete the exam successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/exams/${deleteTestExamId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(200);

      expect(response.body.message).toBeDefined();
    });

    it('should verify exam is removed after deletion', async () => {
      const deletedExam = await prisma.exam.findUnique({
        where: { id: deleteTestExamId },
      });
      expect(deletedExam).toBeNull();
    });

    it('should return 404 when deleting non-existent exam', async () => {
      await request(app.getHttpServer())
        .delete('/exams/non-existent-id')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(404);
    });

    it('should delete exam using main lifecycle test exam', async () => {
      await request(app.getHttpServer())
        .delete(`/exams/${testExamId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(200);

      // Final validation: check Prisma directly to ensure it's gone
      const deletedExam = await prisma.exam.findUnique({
        where: { id: testExamId },
      });
      expect(deletedExam).toBeNull();
    });
  });
});