import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class StatsDto {
  @ApiProperty({ description: 'ID for stats lookup (user, exam, subject, etc.)' })
  @IsString()
  @IsNotEmpty()
  id!: string;
}

