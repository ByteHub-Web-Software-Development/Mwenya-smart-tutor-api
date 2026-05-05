import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-change-me',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));


export function getJwtOptions(configService: ConfigService) {
  return {
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d') || '7d',
    } as { expiresIn: number | string },
  };
}
