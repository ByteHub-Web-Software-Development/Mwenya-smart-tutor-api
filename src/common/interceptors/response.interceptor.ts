import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  statusCode: number;
  message: string | object;
  data?: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode || 200;

    return next.handle().pipe(
      map((data) => {
        // If service returns pre-shaped { statusCode, message, data }, preserve
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return {
            ...data,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          statusCode,
          message: 'Request successful',
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}


