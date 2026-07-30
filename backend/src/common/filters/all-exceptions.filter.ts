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
import { RequestContext } from '../context/request-context'
import { sanitizeUnexpectedError } from './error-sanitizer'

/** Maps any thrown error to the standard error envelope (HTTP status preserved). */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)
  private readonly isProduction = process.env.NODE_ENV === 'production'

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
    } else {
      // Unexpected (Prisma / driver / TypeError). Its message can name tables,
      // columns and constraints, so it never leaves the server in production —
      // the request id ties the client's response to the full log entry.
      const requestId = RequestContext.get()?.requestId
      const { clientMessage, logMessage } = sanitizeUnexpectedError(exception, this.isProduction)
      message = clientMessage
      this.logger.error(
        `[${requestId ?? 'no-request-id'}] ${logMessage}`,
        exception instanceof Error ? exception.stack : undefined,
      )
      if (requestId) errors = [{ code: 'REQUEST_ID', message: requestId }]
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
