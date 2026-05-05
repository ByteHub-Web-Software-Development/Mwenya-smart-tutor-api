import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsString} from 'class-validator';  


export class UpdateFullExamDto {
  @ApiProperty({ example: 'exam_id_abc123', description: 'ID of the exam to update' })
  @IsString()
  @IsNotEmpty()
  conditionValue!: string;

  @ApiProperty({ example: 'Mathematics Paper 2' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: '3 hours' })
  @IsString()
  @IsNotEmpty()
  duration!: string;

  @ApiProperty({ example: 'pdf' })
  @IsString()
  @IsNotEmpty()
  media_type!: string;

  @ApiProperty({ example: 'https://cdn.example.com/exam.pdf' })
  @IsString()
  @IsNotEmpty()
  media_value!: string;

  @ApiProperty({ example: 'subject_id_xyz' })
  @IsString()
  @IsNotEmpty()
  subject_id!: string;

  @ApiProperty({ example: 'id', description: 'Condition column name' })
  @IsString()
  condition!: string;
}
