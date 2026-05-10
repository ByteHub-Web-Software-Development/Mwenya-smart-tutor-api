import { IsOptional, IsISO8601 } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DateRangeDto {
  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsISO8601()
  endDate?: string;
}