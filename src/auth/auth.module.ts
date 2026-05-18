/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from '../common/guards/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const expiresIn = config.get<string>('JWT_EXPIRES_IN', '7d');
        const parsedExpiresIn = /^\d+$/.test(expiresIn) ? parseInt(expiresIn, 10) : expiresIn;
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: parsedExpiresIn as any },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
