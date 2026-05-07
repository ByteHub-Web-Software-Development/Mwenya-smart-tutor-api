import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLessonDto {
  @ApiProperty({ example: 'id', description: 'Condition value (lesson ID)' })
  @IsString()
  @IsNotEmpty()
  conditionValue!: string;

  @ApiProperty({ example: 'title', description: 'Column to update' })
  @IsString()
  @IsNotEmpty()
  column!: string;

  @ApiProperty({ example: 'Advanced Algebra', description: 'New value' })
  @IsString()
  @IsNotEmpty()
  updateValue!: string;

  @ApiProperty({ example: 'condition', description: 'Condition column' })
  @IsString()
  @IsNotEmpty()
  condition!: string;
}

