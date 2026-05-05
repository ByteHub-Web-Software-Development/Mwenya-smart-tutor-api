import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from './guards/jwt.strategy';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN', '7d') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtStrategy,
    HttpExceptionFilter,
    ResponseInterceptor,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    HttpExceptionFilter,
    ResponseInterceptor,
    JwtAuthGuard,
    RolesGuard,
    JwtStrategy,
    JwtModule,
  ],
})
export class CommonModule {
  static exports: any;
}

