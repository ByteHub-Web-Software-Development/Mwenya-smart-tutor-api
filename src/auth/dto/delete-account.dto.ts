import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({ example: 'john_doe', description: 'Username of the account to delete' })
  @IsString()
  @IsNotEmpty()
  username!: string;
}
