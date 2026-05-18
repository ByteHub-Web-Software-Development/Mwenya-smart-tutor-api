import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChatRequest, ChatResponse } from '../types/chat-types';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  constructor(private configService: ConfigService) {}

  private truncate(str: string, maxLen: number): string {
    if (typeof str !== 'string') return '';
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen);
  }

  async chat(chatRequest: ChatRequest): Promise<ChatResponse> {
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new InternalServerErrorException('Chat service is not configured.');
    }

    const messages = (chatRequest.messages || []).map((message) => ({
      role: message.role,
      content: message.text,
    }));

    const timeoutMs = this.configService.get<number>('AI_CHAT_TIMEOUT_MS') ?? 15000;

    try {
      // Gemini content generation (Google Generative Language API)
      // Uses the same message format: [{ role, content }]
      const systemInstruction = messages
        .filter((m: any) => m.role === 'system')
        .map((m: any) => m.content)
        .join('\n');

      const userTurn = messages
        .filter((m: any) => m.role !== 'system')
        .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n');

      const geminiPrompt = [systemInstruction, userTurn].filter(Boolean).join('\n');

      const { data } = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          contents: [
            {
              parts: [{ text: geminiPrompt }],
            },
          ],
          generationConfig: {
            temperature: 1.3,
            maxOutputTokens: 1024,
          },
        },
        {
          timeout: timeoutMs,
          params: {
            key: geminiApiKey,
          },
        },
      );

      const content =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      const description = this.truncate(String(content ?? ''), 6000);

      if (!description) {
        throw new InternalServerErrorException('AI provider returned an empty response.');
      }

      return {
        statusCode: 200,
        message: {
          description,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException('AI provider unavailable.');
    }
  }
}
