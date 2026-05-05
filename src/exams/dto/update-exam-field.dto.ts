import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateExamFieldDto {
  @ApiProperty({ example: 'title', description: 'Column to update' })
  @IsString()
  @IsNotEmpty()
  column!: string;

  @ApiProperty({ example: 'New Mathematics Title', description: 'New value for the column' })
  @IsString()
  @IsNotEmpty()
  updateValue!: string;

  @ApiProperty({ example: 'id', description: 'Condition column' })
  @IsString()
  @IsNotEmpty()
  condition!: string;

  @ApiProperty({ example: 'exam_id_abc123', description: 'Condition value (exam ID)' })
  @IsString()
  @IsNotEmpty()
  conditionValue!: string;
}
