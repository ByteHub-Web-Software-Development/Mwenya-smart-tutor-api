import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Config Schema - imported from config.schema.ts
import { configSchema, validationOptions } from './config/config.schema';
import { appConfig, getThrottlerOptions } from './config/app.config';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { ExamsModule } from './exams/exams.module';
import { LessonsModule } from './lessons/lessons.module';
import { SubjectsModule } from './subjects/subjects.module';
import { SubjectTopicModule } from './subject-topic/subject-topic.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PaymentModule } from './payment/payment.module';
import { StatsModule } from './stats/stats.module';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma/prisma.module';

// Global Providers
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Config — loads .env globally with schema validation
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configSchema,
      validationOptions,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      cache: true,
      load: [appConfig],
    }),

    // Rate limiting - uses THROTTLE_TTL and THROTTLE_LIMIT from .env
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const throttleOptions = getThrottlerOptions();
        return throttleOptions;
      },
      inject: [ConfigService],
    }),

    // JWT & Guards — used globally (CommonModule)
    CommonModule,

    // Prisma
    PrismaModule,

    // Feature modules
    AuthModule,
    ExamsModule,
    LessonsModule,
    SubjectsModule,
    SubjectTopicModule,
    SubscriptionModule,
    PaymentModule,
    StatsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Global exception filter — uniform error shape
    { provide: APP_FILTER, useClass: HttpExceptionFilter },

    // Global response interceptor — wraps all success responses
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },

// Global JWT guard — all routes protected unless @Public() (uses JwtStrategy)
{ provide: APP_GUARD, useClass: JwtAuthGuard },

    // Global roles guard — enforces @Roles() decorator
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
