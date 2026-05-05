import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteRequestDto {
  @ApiProperty({ example: '260971234567', description: 'MSISDN of the account to delete' })
  @IsString()
  @IsNotEmpty()
  msisdn!: string;
}
