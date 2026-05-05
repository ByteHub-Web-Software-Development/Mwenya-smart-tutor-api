import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSubjectDto {
  @ApiProperty({ example: 'Advanced Mathematics', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  exam_description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  exam_title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lesson_description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lesson_title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pictureURL?: string;
}

