import { LOCALES, type Locale } from './useLocale'

export interface I18nSeoInput {
  /** Locale-independent route, e.g. '/', '/blog', '/qr-menu', '/blog/qr-menu'. */
  base: string
  title: Record<Locale, string>
  description: Record<Locale, string>
  ogImage?: string
  type?: 'website' | 'article'
}

const OG_LOCALE: Record<Locale, string> = { hy: 'hy_AM', ru: 'ru_RU', en: 'en_US' }
const DEFAULT_OG = 'https://menus.am/og-image.png'

/**
 * Emit fully localized <head> for a marketing page: title/description in the
 * current locale, a self-referencing canonical, and hreflang alternates for
 * all three languages plus x-default (hy). Reactive to locale changes.
 */
export function useI18nSeo(input: I18nSeoInput | (() => I18nSeoInput)) {
  const { locale, toLocale, absolute } = useLocale()
  const data = computed(() => (typeof input === 'function' ? input() : input))
  const canonical = computed(() => absolute(toLocale(data.value.base, locale.value)))

  useHead(() => {
    const d = data.value
    const loc = locale.value
    const alternates = LOCALES.map((l) => ({
      rel: 'alternate',
      hreflang: l,
      href: absolute(toLocale(d.base, l)),
    }))
    return {
      htmlAttrs: { lang: loc },
      title: d.title[loc],
      meta: [
        { name: 'description', content: d.description[loc] },
        { property: 'og:type', content: d.type ?? 'website' },
        { property: 'og:title', content: d.title[loc] },
        { property: 'og:description', content: d.description[loc] },
        { property: 'og:url', content: canonical.value },
        { property: 'og:image', content: d.ogImage ?? DEFAULT_OG },
        { property: 'og:locale', content: OG_LOCALE[loc] },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: d.title[loc] },
        { name: 'twitter:description', content: d.description[loc] },
      ],
      link: [
        { rel: 'canonical', href: canonical.value },
        ...alternates,
        { rel: 'alternate', hreflang: 'x-default', href: absolute(toLocale(d.base, 'hy')) },
      ],
    }
  })

  return { locale, canonical }
}
