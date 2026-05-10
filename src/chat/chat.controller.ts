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
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatMessageDto } from './dto/chat-message.dto';


@ApiTags('Chat')

@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(ThrottlerGuard)
  @Post('chatbot')
  @ApiOperation({
    summary: 'Send a message to the AI tutor',
    description: 'Sends a conversation to the Gemini AI model. Rate-limited — check THROTTLE_TTL and THROTTLE_LIMIT env vars for current limits.',
  })
  @ApiBody({ type: ChatRequestDto })
  @ApiResponse({ status: 201, description: 'AI response returned.' })
  @ApiResponse({ status: 429, description: 'Too many requests — rate limit exceeded.' })
  @ApiResponse({ status: 500, description: 'AI provider unavailable.' })
  async chat(@Body() chatRequest: ChatRequestDto) {
    return this.chatService.chat(chatRequest);
  }

  @Post('message')
  @ApiOperation({ summary: 'Send a single chat message to the AI tutor' })
  @ApiBody({ type: ChatMessageDto })
  @ApiResponse({ status: 201, description: 'AI response returned.' })
  @ApiResponse({ status: 500, description: 'AI provider unavailable.' })
  async sendMessage(@Body() message: ChatMessageDto) {
    return this.chatService.chat({ messages: [message] });
  }
}

