import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({ example: 'user_id_abc123', description: 'User ID initiating payment' })
  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @ApiProperty({ example: '50.00', description: 'Payment amount' })
  @IsString()
  @IsNotEmpty()
  amount!: string;

  @ApiProperty({ example: 'monthly', description: 'Subscription period', enum: ['monthly', 'termly', 'yearly'] })
  @IsString()
  @IsNotEmpty()
  period!: string;

  @ApiProperty({ example: '260971234567', description: 'Mobile money phone number' })
  @IsString()
  @IsNotEmpty()
  msisdn!: string;
}