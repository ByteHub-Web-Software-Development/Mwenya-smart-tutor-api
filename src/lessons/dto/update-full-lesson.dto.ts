
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
