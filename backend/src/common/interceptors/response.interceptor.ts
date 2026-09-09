import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import type { ApiResponse, ApiMeta } from '../interfaces/api-response.interface'
import { PUBLIC_CACHE_KEY } from '../decorators/public-cache.decorator'

/** Wraps every successful controller return in the standard envelope. */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<unknown>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<unknown>> {
    // API responses are tenant-specific (tenant comes from the Authorization
    // header, not the URL). Never let the browser/proxy cache them, otherwise a
    // 304 can serve one tenant's data for another's request.
    //
    // The exception is a handler marked @PublicCache(): unauthenticated, and its
    // URL says exactly what comes back. Those revalidate on every request
    // (`no-cache`), so Express answers an unchanged menu with a bodyless 304
    // instead of ~100 KB — and an admin edit is still visible immediately.
    const res = ctx.switchToHttp().getResponse()
    const cacheable = this.reflector.getAllAndOverride<boolean>(PUBLIC_CACHE_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    res.setHeader('Cache-Control', cacheable ? 'public, no-cache' : 'no-store')
    if (!cacheable) res.setHeader('Vary', 'Authorization')

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
