import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddExamDto {
  @ApiProperty({ example: 'Mathematics Paper 1', description: 'Exam title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: '3 hours', description: 'Exam duration' })
  @IsString()
  @IsNotEmpty()
  duration!: string;

  @ApiProperty({ example: 'pdf', description: 'Media type (pdf, video, etc.)' })
  @IsString()
  @IsNotEmpty()
  media_type!: string;

  @ApiProperty({ example: 'https://cdn.example.com/exam.pdf', description: 'Media URL or value' })
  @IsString()
  @IsNotEmpty()
  media_value!: string;

  @ApiProperty({ example: '2024', description: 'Exam year' })
  @IsString()
  @IsNotEmpty()
  year!: string;

  @ApiProperty({ example: 'subject_id_abc123', description: 'ID of the related subject' })
  @IsString()
  @IsNotEmpty()
  subject!: string;
}
