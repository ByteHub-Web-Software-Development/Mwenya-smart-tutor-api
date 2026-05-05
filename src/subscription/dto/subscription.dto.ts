import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'user_id_abc123', description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ example: 'trans_abc123', description: 'Payment transaction ID' })
  @IsString()
  @IsNotEmpty()
  trans_id: string;

  @ApiProperty({ example: 'sub_details_id_abc', description: 'Subscription plan ID' })
  @IsString()
  @IsNotEmpty()
  sub_details_id: string;

  @ApiProperty({ example: 'monthly', description: 'Subscription type', enum: ['monthly', 'termly', 'yearly'] })
  @IsString()
  @IsOptional()
  subscription_type?: string;

  @ApiProperty({ example: 50.0, description: 'Payment amount' })
  @IsOptional()
  amount?: number;

  @ApiProperty({ example: 5.0, description: 'Commission amount' })
  @IsOptional()
  commission?: number;
}
