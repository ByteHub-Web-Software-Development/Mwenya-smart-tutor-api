import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTopicDto {
  @ApiProperty({ example: 'subject_id_abc123', description: 'ID of the parent subject' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({ example: 'Quadratic Equations', description: 'Topic title' })
  @IsString()
  @IsNotEmpty()
  title!: string;
}

export class UpdateTopicDto {
  @ApiProperty({ example: 'Linear Equations', required: false })
  @IsString()
  @IsOptional()
  title?: string;
}
