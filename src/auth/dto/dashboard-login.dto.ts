import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class DashboardLoginDto {
  @ApiProperty({ example: '260971234567', description: 'User MSISDN for dashboard login' })
  @IsString()
  @IsNotEmpty()
  msisdn!: string;

  @ApiProperty({ example: '1234', description: 'User PIN' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  pin!: string;

  @ApiProperty({ example: 'device-uuid-abc123', description: 'Unique device identifier' })
  @IsString()
  @IsNotEmpty()
  device_id!: string;
}
