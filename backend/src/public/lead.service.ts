import { BadGatewayException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CreateLeadDto } from './dto/create-lead.dto'

/** Forwards landing "Get started" leads to a Telegram chat. Token/chat id
 *  live only in the backend .env — never exposed to the browser. */
@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name)
  constructor(private readonly config: ConfigService) {}

  private esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  async submit(dto: CreateLeadDto, meta?: { ua?: string }): Promise<{ ok: true }> {
    // Honeypot tripped → pretend success, drop silently.
    if (dto.website) return { ok: true }

    const token = this.config.get<string>('telegram.botToken')
    const chatId = this.config.get<string>('telegram.chatId')
    if (!token || !chatId) {
      this.logger.error('Telegram not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)')
      throw new ServiceUnavailableException('Contact channel is not configured yet')
    }

    const lines = [
      '🆕 <b>Նոր հայտ — QR Menu</b>',
      dto.name ? `👤 ${this.esc(dto.name)}` : null,
      `📞 ${this.esc(dto.phone)}`,
      dto.plan ? `📦 ${this.esc(dto.plan)}` : null,
      dto.message ? `📝 ${this.esc(dto.message)}` : null,
      `🕒 ${new Date().toLocaleString('hy-AM', { timeZone: 'Asia/Yerevan' })}`,
    ].filter(Boolean)

    let res: Response
    try {
      res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: lines.join('\n'), parse_mode: 'HTML', disable_web_page_preview: true }),
      })
    } catch (e) {
      this.logger.error(`Telegram request failed: ${(e as Error).message}`)
      throw new BadGatewayException('Could not deliver your request, please call us')
    }
    if (!res.ok) {
      this.logger.error(`Telegram responded ${res.status}: ${await res.text().catch(() => '')}`)
      throw new BadGatewayException('Could not deliver your request, please call us')
    }
    return { ok: true }
  }
}
