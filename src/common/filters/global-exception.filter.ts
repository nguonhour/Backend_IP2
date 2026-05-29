import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: number;
    let message: string;
    let code: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const errorResponse = exceptionResponse as any;
        message = errorResponse.message || exception.message;
        code = errorResponse.code || 'INTERNAL_ERROR';
      } else {
        message = exception.message;
        code = 'INTERNAL_ERROR';
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      code = 'INTERNAL_ERROR';

      this.logger.error(`Unhandled exception: ${exception.message}`, {
        stack: exception.stack,
        url: request.url,
        method: request.method,
      });
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      code = 'INTERNAL_ERROR';

      this.logger.error(`Unknown exception`, {
        exception,
        url: request.url,
        method: request.method,
      });
    }

    const errorResponse = {
      statusCode: status,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
