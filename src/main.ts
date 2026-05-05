/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from './common/interceptors/response.interceptor'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS
  app.enableCors({ origin: '*' });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,        // Auto-transform query params to declared types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global response interceptor - registered in main.ts as requested
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ─── OpenAPI / Scalar Setup ───────────────────────────────────────────────
  const openApiConfig = new DocumentBuilder()
    .setTitle('SmartTutor API')
    .setDescription(
      `The SmartTutor API powers the SmartTutorZM mobile and web applications.
It provides endpoints for authentication, content management (subjects, lessons, exams),
subscriptions, payments, AI-powered chat, and analytics.

**Authentication:** All endpoints require a Bearer JWT token unless marked as Public.
Obtain a token via \`POST /auth/login\` or \`POST /auth/dashboard/login\`.

**Roles:** \`1\` = Student · \`2\` = Teacher · \`3\` = Sales Manager · \`4\` = Admin`,
    )
    .setVersion('2.0.0')
    .addTag('Auth', 'User authentication and account management')
    .addTag('Exams', 'Exam paper and content management')
    .addTag('Lessons', 'Lesson management')
    .addTag('Subjects', 'Subject catalogue')
    .addTag('Subject Topics', 'Topics under each subject')
    .addTag('Subscription', 'Subscription plans and user subscriptions')
    .addTag('Payment', 'Payment initiation and receipts')
    .addTag('Stats - Admin', 'Admin-level analytics and reporting')
    .addTag('Stats - Sales Manager', 'Sales manager performance stats')
    .addTag('Stats - Teacher', 'Teacher referral and student stats')
    .addTag('Chat', 'AI chatbot integration')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'Bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, openApiConfig);

  // Raw OpenAPI JSON for tooling (Scalar, Postman, etc.)
  SwaggerModule.setup('api-json', app, document);

  // Scalar API Reference UI
  const { apiReference } = await import('@scalar/nestjs-api-reference');
  app.use(
    '/reference',
    apiReference({
      content: document,
      theme: 'purple',
    }),
  );

  const port = configService.get<number>('PORT', 5180);
  await app.listen(port);
  console.log(`\n🚀 SmartTutor API running on http://localhost:${port}`);
  console.log(`📖 API Reference (Scalar): http://localhost:${port}/reference`);
  console.log(`📄 OpenAPI JSON:            http://localhost:${port}/api-json\n`);
}
void bootstrap();

