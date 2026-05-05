import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '260971234567', description: 'User MSISDN (mobile number)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^260(9[765][0-9]{7}|100000000)$/, { message: 'Invalid Zambian MSISDN format' })
  msisdn!: string;

  @ApiProperty({ example: '1234567890', description: 'User PIN' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  pin!: string;

  @ApiProperty({ example: 'device-uuid-abc123', description: 'Unique device identifier' })
  @IsString()
  @IsNotEmpty()
  device_id!: string;
}
