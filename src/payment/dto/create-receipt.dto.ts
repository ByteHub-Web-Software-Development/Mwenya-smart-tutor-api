import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';


export class CreateReceiptDto {
  @ApiProperty({ example: 'trans_abc123', description: 'Transaction ID from payment provider' })
  @IsString()
  @IsNotEmpty()
  trans_id!: string;

  @ApiProperty({ example: '50.00', description: 'Amount paid' })
  @IsString()
  @IsNotEmpty()
  amount!: string;

  @ApiProperty({ example: 'monthly', description: 'Subscription period covered' })
  @IsString()
  @IsNotEmpty()
  period!: string;

  @ApiProperty({ example: 'user_id_abc123', description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  user_id!: string;
}
