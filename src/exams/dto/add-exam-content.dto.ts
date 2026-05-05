import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddExamContentDto {
  @ApiProperty({ example: 'exam_id_abc123', description: 'ID of the parent exam' })
  @IsString()
  @IsNotEmpty()
  exam!: string;

  @ApiProperty({ example: 'marking_scheme', description: 'Type of exam content' })
  @IsString()
  @IsNotEmpty()
  exam_type!: string;

  @ApiProperty({ example: 'https://cdn.example.com/scheme.pdf', description: 'Link to the content' })
  @IsString()
  @IsNotEmpty()
  exam_link!: string;
}
