import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Mathematics', description: 'Subject name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Explore past exam papers', description: 'Exam section description' })
  @IsString()
  @IsNotEmpty()
  exam_description!: string;

  @ApiProperty({ example: 'Past Exam Papers', description: 'Exam section title' })
  @IsString()
  @IsNotEmpty()
  exam_title!: string;

  @ApiProperty({ example: 'Watch recorded lessons', description: 'Lesson section description' })
  @IsString()
  @IsNotEmpty()
  lesson_description!: string;

  @ApiProperty({ example: 'Video Lessons', description: 'Lesson section title' })
  @IsString()
  @IsNotEmpty()
  lesson_title!: string;

  @ApiProperty({ example: 'https://cdn.example.com/maths.png', description: 'Subject thumbnail URL' })
  @IsString()
  @IsNotEmpty()
  pictureURL!: string;
}

