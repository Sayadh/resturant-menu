import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Response } from 'express'
import type { ApiError, ApiResponse } from '../interfaces/api-response.interface'

/** Maps any thrown error to the standard error envelope (HTTP status preserved). */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'
    let errors: ApiError[] | null = null

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const body = exception.getResponse()
      if (typeof body === 'string') {
        message = body
      } else if (body && typeof body === 'object') {
        const b = body as { message?: unknown; error?: string; errors?: ApiError[] }
        if (Array.isArray(b.message)) {
          // class-validator produces string[] → normalize to field errors.
          message = 'Validation failed'
          errors = b.message.map((m) => ({ message: String(m) }))
        } else if (typeof b.message === 'string') {
          message = b.message
        }
        if (b.errors) errors = b.errors
      }
    } else if (exception instanceof Error) {
      message = exception.message
      this.logger.error(exception.message, exception.stack)
    }

    const payload: ApiResponse<null> = {
      success: false,
      data: null,
      message,
      errors,
      meta: null,
    }
    res.status(status).json(payload)
  }
}
