export interface ChatMessage {
    text: string;
    role: 'user' | 'assistant' | 'system';
}

export interface ChatRequest {
    messages: ChatMessage[];
}

export interface ChatResponse {
    statusCode: number;
    message: {
        description: string;
    };
}
