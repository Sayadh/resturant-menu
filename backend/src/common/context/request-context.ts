import { AsyncLocalStorage } from 'node:async_hooks'
import type { AuthUser } from '../types/auth.types'

export interface RequestStore {
  requestId: string
  user?: AuthUser
  restaurantId?: string | null
}

const storage = new AsyncLocalStorage<RequestStore>()

/**
 * Per-request context (AsyncLocalStorage). Lets services/audit/logging read the
 * current user + tenant without threading them through every function call.
 */
export const RequestContext = {
  run<T>(store: RequestStore, callback: () => T): T {
    return storage.run(store, callback)
  },
  get(): RequestStore | undefined {
    return storage.getStore()
  },
  set(patch: Partial<RequestStore>): void {
    const store = storage.getStore()
    if (store) Object.assign(store, patch)
  },
}
