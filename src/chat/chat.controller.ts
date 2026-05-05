import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ChatMessageDto {
  @ApiProperty({ example: 'What is photosynthesis?', description: 'Message text' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ example: 'user', enum: ['user', 'assistant', 'system'] })
  @IsString()
  role: 'user' | 'assistant' | 'system';
}

class ChatRequestDto {
  @ApiProperty({ type: [ChatMessageDto], description: 'Conversation history' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(ThrottlerGuard)
  @Post('chatbot')
  @ApiOperation({
    summary: 'Send a message to the AI tutor',
    description: 'Sends a conversation to the DeepSeek AI model. Rate-limited — check THROTTLE_TTL and THROTTLE_LIMIT env vars for current limits.',
  })
  @ApiBody({ type: ChatRequestDto })
  @ApiResponse({ status: 201, description: 'AI response returned.' })
  @ApiResponse({ status: 429, description: 'Too many requests — rate limit exceeded.' })
  @ApiResponse({ status: 500, description: 'AI provider unavailable.' })
  async chat(@Body() chatRequest: ChatRequestDto) {
    return this.chatService.chat(chatRequest);
  }
}
