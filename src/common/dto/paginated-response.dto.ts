import { ApiProperty } from '@nestjs/swagger';


export class PaginatedResponseDto<T> {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: 'Request successful' })
  message!: string | object;

  @ApiProperty({ isArray: true })
  data?: T[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: '2026-04-17T08:00:00.000Z' })
  timestamp!: string;
}



