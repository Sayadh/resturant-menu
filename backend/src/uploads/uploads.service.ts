import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'

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

    const storageKey = `restaurants/${restaurantId}/${randomUUID()}.${ext}`
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

  /** Best-effort delete of a previously uploaded object (orphan cleanup). */
  async remove(storageKey: string | null | undefined): Promise<void> {
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

  /** Extract the object key from one of OUR public URLs; null for foreign URLs. */
  private keyFromUrl(url: string | null | undefined): string | null {
    if (!url || !this.url) return null
    const prefix = `${this.url}/storage/v1/object/public/${this.bucket}/`
    return url.startsWith(prefix) ? url.slice(prefix.length) : null
  }

  /** Best-effort delete by public URL (ignores links that aren't ours). */
  async removeByUrl(url: string | null | undefined): Promise<void> {
    await this.remove(this.keyFromUrl(url))
  }

  async removeManyByUrl(urls: (string | null | undefined)[]): Promise<void> {
    await Promise.all(urls.map((u) => this.removeByUrl(u)))
  }

  /**
   * Delete by URL, but ONLY if the object belongs to `restaurantId` (its key is
   * under `restaurants/<id>/`). Prevents a tenant from deleting another's files.
   */
  async removeOwnByUrl(restaurantId: string, url: string | null | undefined): Promise<void> {
    const key = this.keyFromUrl(url)
    if (key && key.startsWith(`restaurants/${restaurantId}/`)) {
      await this.remove(key)
    } else {
      this.logger.warn(`Storage delete rejected (out of scope): url=${url} key=${key} rid=${restaurantId}`)
    }
  }
}
