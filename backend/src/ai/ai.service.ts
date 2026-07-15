import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'

type Lang = 'hy' | 'ru' | 'en'
const LANG_NAME: Record<Lang, string> = { hy: 'Armenian', ru: 'Russian', en: 'English' }
// AI features are a paid perk — Professional & Business only.
const AI_PLANS = ['pro', 'business']
// Monthly cap on AI calls per restaurant (cost guard).
const AI_MONTHLY_LIMIT = 1200

/**
 * AI helpers for the admin: translate menu text between hy/ru/en and generate
 * appetizing product descriptions. Uses OpenAI Chat Completions over plain
 * fetch (no SDK → no extra deps / Node-version issues). Gated by plan.
 */
@Injectable()
export class AiService {
  private readonly apiKey: string
  private readonly model: string

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.apiKey = config.get<string>('openai.apiKey') || ''
    this.model = config.get<string>('openai.model') || 'gpt-4o-mini'
  }

  /** Enforce plan + configuration before any AI call. */
  private async assertAllowed(restaurantId: string | null | undefined): Promise<void> {
    if (!this.apiKey) throw new InternalServerErrorException('AI is not configured')
    if (!restaurantId) throw new ForbiddenException('No restaurant context')
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, deletedAt: null },
      select: { plan: { select: { key: true } } },
    })
    const key = restaurant?.plan?.key
    if (!key || !AI_PLANS.includes(key)) {
      throw new ForbiddenException('AI features are available on the Professional and Business plans')
    }
  }

  /** Check the monthly quota and reserve one call (atomic increment). */
  private async reserveMonthlyCall(restaurantId: string): Promise<void> {
    const period = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
    const usage = await this.prisma.aiUsage.upsert({
      where: { restaurantId_period: { restaurantId, period } },
      create: { restaurantId, period, count: 0 },
      update: {},
    })
    if (usage.count >= AI_MONTHLY_LIMIT) {
      throw new ForbiddenException(`Monthly AI limit reached (${AI_MONTHLY_LIMIT})`)
    }
    await this.prisma.aiUsage.update({
      where: { restaurantId_period: { restaurantId, period } },
      data: { count: { increment: 1 } },
    })
  }

  /** Low-level: one JSON-returning chat completion. */
  private async chatJson(system: string, user: string): Promise<Record<string, unknown>> {
    let res: Response
    try {
      res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      })
    } catch {
      throw new InternalServerErrorException('AI request failed')
    }
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new InternalServerErrorException(`AI request failed (${res.status}): ${detail.slice(0, 200)}`)
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    const content = data.choices?.[0]?.message?.content ?? '{}'
    try {
      return JSON.parse(content) as Record<string, unknown>
    } catch {
      throw new InternalServerErrorException('AI returned an unexpected response')
    }
  }

  private clean(langs: Lang[], obj: Record<string, unknown>): Record<Lang, string> {
    const out = {} as Record<Lang, string>
    for (const l of langs) out[l] = typeof obj[l] === 'string' ? (obj[l] as string).trim() : ''
    return out
  }

  /** Translate `text` (written in `source`) into every `targets` language. */
  async translate(
    restaurantId: string | null | undefined,
    text: string,
    source: Lang,
    targets: Lang[],
  ): Promise<Record<Lang, string>> {
    await this.assertAllowed(restaurantId)
    const value = (text || '').trim()
    const langs = targets.filter((l) => l !== source)
    if (!value || langs.length === 0) return {} as Record<Lang, string>
    await this.reserveMonthlyCall(restaurantId as string)

    const system =
      'You are a professional menu translator for restaurants and cafés. ' +
      'Translate faithfully and naturally, keeping it concise and appetizing. ' +
      'Keep proper names, brand names and units unchanged. ' +
      'Reply ONLY as a JSON object keyed by language code.'
    const user =
      `Source language: ${LANG_NAME[source]}.\n` +
      `Text: """${value}"""\n` +
      `Translate into: ${langs.map((l) => `${l} (${LANG_NAME[l]})`).join(', ')}.\n` +
      `Return JSON like {${langs.map((l) => `"${l}": "..."`).join(', ')}}.`
    return this.clean(langs, await this.chatJson(system, user))
  }

  /** Generate an appetizing description for a dish `name`, in every requested language. */
  async describe(
    restaurantId: string | null | undefined,
    name: string,
    langs: Lang[],
  ): Promise<Record<Lang, string>> {
    await this.assertAllowed(restaurantId)
    const dish = (name || '').trim()
    const targets = langs.length ? langs : (['hy'] as Lang[])
    if (!dish) return {} as Record<Lang, string>
    await this.reserveMonthlyCall(restaurantId as string)

    const system =
      'You write short, appetizing menu descriptions for restaurants and cafés. ' +
      'One or two sentences, tasteful and specific, no prices, no emojis, no quotes. ' +
      'Reply ONLY as a JSON object keyed by language code, each value a description in that language.'
    const user =
      `Dish name: """${dish}""".\n` +
      `Write a description in: ${targets.map((l) => `${l} (${LANG_NAME[l]})`).join(', ')}.\n` +
      `Return JSON like {${targets.map((l) => `"${l}": "..."`).join(', ')}}.`
    return this.clean(targets, await this.chatJson(system, user))
  }
}
