import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import { resolveOwnedKey, TENANT_PREFIX } from './storage-key'

/** Allowed image mime-types → file extension. */
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Uploads images to Supabase Storage via its REST API using plain fetch.
 *
 * We deliberately avoid @supabase/supabase-js here: its createClient() spins up
 * a Realtime (WebSocket) client that throws on Node < 22 ("no native WebSocket
 * support"). We only need Storage, so a couple of REST calls are lighter, have
 * zero extra dependencies and no WebSocket requirement. The service (secret)
 * key lives only server-side; the browser never sees it. Files are stored under
 * a per-tenant path so restaurants stay isolated and cleanup is trivial.
 */
@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name)
  private readonly url: string
  private readonly key: string
  private readonly bucket: string

  constructor(config: ConfigService) {
    this.url = (config.get<string>('supabase.url') || '').replace(/\/$/, '')
    this.key = config.get<string>('supabase.secretKey') || ''
    this.bucket = config.get<string>('supabase.bucket') || 'menu-images'
  }

  private assertConfigured(): void {
    if (!this.url || !this.key) {
      throw new InternalServerErrorException('Image storage is not configured')
    }
  }

  private headers(): Record<string, string> {
    return { Authorization: `Bearer ${this.key}`, apikey: this.key }
  }

  async uploadImage(
    restaurantId: string | null | undefined,
    file: Express.Multer.File | undefined,
  ): Promise<{ url: string; storageKey: string }> {
    this.assertConfigured()
    if (!restaurantId) throw new BadRequestException('No restaurant context')
    if (!file) throw new BadRequestException('No file provided')

    const ext = ALLOWED[file.mimetype]
    if (!ext) throw new BadRequestException('Unsupported image type (use JPG, PNG, WebP or GIF)')
    if (file.size > MAX_BYTES) throw new BadRequestException('Image too large (max 5MB)')

    const storageKey = `${TENANT_PREFIX}/${restaurantId}/${randomUUID()}.${ext}`
    const res = await fetch(
      `${this.url}/storage/v1/object/${this.bucket}/${storageKey}`,
      {
        method: 'POST',
        headers: {
          ...this.headers(),
          'Content-Type': file.mimetype,
          'cache-control': 'public, max-age=31536000, immutable',
          'x-upsert': 'false',
        },
        body: file.buffer as unknown as BodyInit,
      },
    )
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new InternalServerErrorException(`Upload failed (${res.status}): ${detail}`)
    }

    const url = `${this.url}/storage/v1/object/public/${this.bucket}/${storageKey}`
    return { url, storageKey }
  }

  /**
   * Low-level delete. PRIVATE on purpose: every caller must go through
   * `removeOwnByUrl` / `removeManyOwnByUrl`, which enforce tenant ownership.
   * Bypassing this would re-open the cross-tenant deletion hole.
   */
  private async remove(storageKey: string | null | undefined): Promise<void> {
    if (!storageKey || !this.url || !this.key) {
      this.logger.warn(`Storage delete skipped (missing key/config): key=${storageKey}`)
      return
    }
    try {
      const res = await fetch(`${this.url}/storage/v1/object/${this.bucket}/${storageKey}`, {
        method: 'DELETE',
        headers: this.headers(),
      })
      if (res.ok) {
        this.logger.log(`Storage delete OK: ${storageKey}`)
      } else if (res.status === 404 || res.status === 400) {
        // Already gone (Supabase returns 400/404 "not_found") — treat as success.
        this.logger.log(`Storage object already absent: ${storageKey}`)
      } else {
        const detail = await res.text().catch(() => '')
        this.logger.error(`Storage delete failed ${res.status} for ${storageKey}: ${detail}`)
      }
    } catch (e) {
      this.logger.error(`Storage delete error for ${storageKey}: ${(e as Error).message}`)
    }
  }

  /**
   * Delete by public URL, but ONLY when the object provably belongs to
   * `restaurantId` (key is exactly `restaurants/<restaurantId>/...`).
   *
   * `restaurantId` MUST come from the authenticated request context
   * (JWT → RestaurantScopeGuard → req.restaurantId) — never from a DTO,
   * query param or anything else the client controls.
   *
   * Returns whether a delete was actually attempted, so explicit user-facing
   * endpoints can surface an authorization failure while best-effort cleanup
   * paths can simply carry on (a missing/foreign old file must never break a
   * DB update that already succeeded).
   */
  async removeOwnByUrl(
    restaurantId: string | null | undefined,
    url: string | null | undefined,
  ): Promise<boolean> {
    const result = resolveOwnedKey(this.url, this.bucket, restaurantId, url)
    if (!result.ok) {
      // Deliberately terse: never echo another tenant's key/URL back to a caller.
      this.logger.warn(`Storage delete rejected (${result.reason}) rid=${restaurantId ?? 'none'}`)
      return false
    }
    await this.remove(result.key)
    return true
  }

  /** Best-effort, tenant-scoped bulk cleanup (e.g. replaced product images). */
  async removeManyOwnByUrl(
    restaurantId: string | null | undefined,
    urls: (string | null | undefined)[],
  ): Promise<void> {
    await Promise.all(urls.map((u) => this.removeOwnByUrl(restaurantId, u)))
  }

  /**
   * Explicit, user-initiated delete (admin "remove image" button). Unlike the
   * best-effort cleanup paths this reports an authorization failure instead of
   * silently succeeding — with a generic message that leaks nothing about the
   * owning tenant.
   */
  async removeOwnByUrlOrFail(restaurantId: string | null | undefined, url: string | null | undefined): Promise<void> {
    const deleted = await this.removeOwnByUrl(restaurantId, url)
    if (!deleted) throw new ForbiddenException('This image cannot be deleted')
  }
}
