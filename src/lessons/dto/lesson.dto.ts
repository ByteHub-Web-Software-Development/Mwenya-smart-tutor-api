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

export class UpdateLessonFieldDto {
  @ApiProperty({ example: 'title', description: 'Column to update' })
  @IsString()
  @IsNotEmpty()
  column!: string;

  @ApiProperty({ example: 'Advanced Algebra', description: 'New value' })
  @IsString()
  @IsNotEmpty()
  updateValue!: string;

  @ApiProperty({ example: 'id', description: 'Condition column' })
  @IsString()
  @IsNotEmpty()
  condition!: string;

  @ApiProperty({ example: 'lesson_id_abc123', description: 'Condition value (lesson ID)' })
  @IsString()
  @IsNotEmpty()
  conditionValue!: string;
}

export class UpdateFullLessonDto {
  @ApiProperty({ example: 'lesson_id_abc123', description: 'ID of the lesson to update' })
  @IsString()
  @IsNotEmpty()
  conditionValue!: string;

  @ApiProperty({ example: 'Advanced Algebra' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: '60 minutes' })
  @IsString()
  @IsNotEmpty()
  duration!: string;

  @ApiProperty({ example: 'video' })
  @IsString()
  @IsNotEmpty()
  media_type!: string;

  @ApiProperty({ example: 'https://cdn.example.com/lesson.mp4' })
  @IsString()
  @IsNotEmpty()
  media_value!: string;

  @ApiProperty({ example: 'subject_id_xyz' })
  @IsString()
  @IsNotEmpty()
  subject_id!: string;

  @ApiProperty({ example: 'id' })
  @IsString()
  condition!: string;
}
