import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray, IsNotEmpty, ArrayMaxSize } from 'class-validator';
import { ChatMessageDto } from './chat-message.dto';

export class ChatRequestDto {
  @ApiProperty({ type: [ChatMessageDto], description: 'Conversation history' })
  @IsArray()
  @IsNotEmpty()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];
}

