import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ example: 'What is photosynthesis?', description: 'Message text' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  text!: string;

  @ApiProperty({ example: 'user', enum: ['user', 'assistant', 'system'] })
  @IsString()
  @IsIn(['user', 'assistant', 'system'])
  role!: 'user' | 'assistant' | 'system';
}

