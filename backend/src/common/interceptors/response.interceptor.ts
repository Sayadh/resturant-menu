import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import type { ApiResponse, ApiMeta } from '../interfaces/api-response.interface'

/** Wraps every successful controller return in the standard envelope. */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<unknown>> {
  intercept(ctx: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<unknown>> {
    // API responses are tenant-specific (tenant comes from the Authorization
    // header, not the URL). Never let the browser/proxy cache them, otherwise a
    // 304 can serve one tenant's data for another's request.
    const res = ctx.switchToHttp().getResponse()
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Vary', 'Authorization')

    return next.handle().pipe(
      map((payload): ApiResponse<unknown> => {
        // Controller can return { data, meta, message? } to pass pagination through.
        if (
          payload &&
          typeof payload === 'object' &&
          'data' in (payload as object) &&
          'meta' in (payload as object)
        ) {
          const p = payload as unknown as { data: unknown; meta: ApiMeta; message?: string }
          return { success: true, data: p.data, message: p.message ?? null, errors: null, meta: p.meta ?? null }
        }
        return { success: true, data: payload ?? null, message: null, errors: null, meta: null }
      }),
    )
  }
}
