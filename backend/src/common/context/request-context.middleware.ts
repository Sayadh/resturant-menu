import { Injectable, NestMiddleware } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'
import { RequestContext } from './request-context'

/** Opens an AsyncLocalStorage scope per request and assigns a request id. */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers['x-request-id']
    const requestId = (typeof incoming === 'string' && incoming) || randomUUID()
    res.setHeader('x-request-id', requestId)
    RequestContext.run({ requestId }, () => next())
  }
}
