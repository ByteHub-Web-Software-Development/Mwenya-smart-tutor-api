import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChatRequest, ChatResponse } from '../types/chat-types';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  constructor(private configService: ConfigService) {}

  async chat(chatRequest: ChatRequest): Promise<ChatResponse> {
    const openAiKey = this.configService.get<string>('OPENAI_KEY');
    const headers = {
      Authorization: `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    };

    const userMessages = chatRequest.messages.map(message => ({
      role: 'user',
      content: message.text,
    }));

    const { data } = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        stream: false,
        temperature: 1.3,
        messages: userMessages,
      },
      { headers },
    );

    return {
      statusCode: 200,
      message: {
        description: data.choices[0].message.content,
      },
    };
  }
}
