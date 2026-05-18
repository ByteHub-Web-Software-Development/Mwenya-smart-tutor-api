import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class PatchExamDto {
  @ApiPropertyOptional({ example: 'Physics Paper - Updated' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({ example: '2h 30m' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  duration?: string;

  @ApiPropertyOptional({ example: 'PDF' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  media_type?: string;

  @ApiPropertyOptional({ example: 'https://example.com/physics.pdf' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  media_value?: string;

  @ApiPropertyOptional({ example: '2027' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  year?: string;

  @ApiPropertyOptional({ example: 'subjectId' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  subject_id?: string;
}

