import { ConfigService } from '@nestjs/config';
import Joi from 'joi';


// Define the expected shape of our environment configuration
export interface EnvConfig {
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  GEMINI_API_KEY?: string;
  DATABASE_URL?: string;
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
  NODE_ENV: string;
}

export const configSchema = Joi.object({
  // Server configuration
  PORT: Joi.number().default(5180).description('Server port number'),

  // Authentication
  JWT_SECRET: Joi.string().required().description('JWT secret key for token signing'),
  JWT_EXPIRES_IN: Joi.string().default('7d').description('JWT token expiration'),

  // Rate limiting (from @nestjs/throttler)
  THROTTLE_TTL: Joi.number().default(60000).description('Throttle time-to-live in ms'),
  THROTTLE_LIMIT: Joi.number().default(20).description('Throttle request limit'),

  // Database
  DATABASE_URL: Joi.string().required().description('MongoDB connection string'),

  // External services (optional)
  GEMINI_API_KEY: Joi.string().required().description('Gemini API key for AI chat'),
  AI_CHAT_TIMEOUT_MS: Joi.number().default(15000),

  // Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development')
    .description('Node environment'),
})
  .unknown() // Allow additional env vars not defined in schema
  .required(); // Ensure validation runs at startup

/**
 * Validation options for ConfigModule
 */
export const validationOptions = {
  allowUnknown: true, // Allow additional environment variables
  abortEarly: false, // Return all errors, not just the first one
};

export function getConfig(configService: ConfigService, key: keyof EnvConfig): string | number | undefined {
  return configService.get(key);
}
