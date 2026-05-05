import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsString} from 'class-validator';

export class UpdateExamDto {
  @ApiProperty({ example: '1', description: 'ID of the exam to update' })
  @IsString()
  @IsNotEmpty()
  id!: string;

}    