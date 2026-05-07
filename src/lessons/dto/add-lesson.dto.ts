import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddLessonDto {
  @ApiProperty({ example: 'Introduction to Algebra', description: 'Lesson title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: '45 minutes', description: 'Lesson duration' })
  @IsString()
  @IsNotEmpty()
  duration!: string;

  @ApiProperty({ example: 'video', description: 'Media type (video, pdf, etc.)' })
  @IsString()
  @IsNotEmpty()
  media_type!: string;

  @ApiProperty({ example: 'https://cdn.example.com/lesson.mp4', description: 'Media URL or value' })
  @IsString()
  @IsNotEmpty()
  media_value!: string;

  @ApiProperty({ example: 'subject_id_abc123', description: 'ID of the related subject' })
  @IsString()
  @IsNotEmpty()
  subject_id!: string;
}

