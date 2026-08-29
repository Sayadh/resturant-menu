import type { Lang, LocalizedText } from '~/data/menu'
import type { LangCode } from '~/models/types'

// DB uses hy/en/ru; the menu content model (LocalizedText) uses AM/EN/RU.
const CODE_TO_LANG: Record<LangCode, Lang> = { hy: 'AM', en: 'EN', ru: 'RU' }
const DISPLAY_ORDER: Lang[] = ['AM', 'EN', 'RU']

// Flag labels for the "flags" switcher mode. Armenian, British and Russian
// flags — the three platform languages, nothing more.
const LANG_FLAG: Record<Lang, string> = { AM: '🇦🇲', EN: '🇬🇧', RU: '🇷🇺' }

/** All platform languages (used only as an ultimate fallback). */
export const allLanguages: Lang[] = ['AM', 'EN', 'RU']

/**
 * Tenant-aware language state. The set of switchable languages is driven by the
 * current restaurant's `activeLanguages`, so disabling a language in the admin
 * removes it from the public switcher; the visible language always falls back to
 * the tenant default if the previously-selected one is no longer active.
 */
export const useLanguage = () => {
  const rs = useRestaurantStore()
  const selected = useState<Lang>('lang', () => 'AM')

  // Enabled languages, mapped to menu codes and shown in a stable order.
  const languages = computed<Lang[]>(() => {
    const active = (rs.restaurant?.activeLanguages ?? []) as LangCode[]
    const mapped = active.map((c) => CODE_TO_LANG[c]).filter(Boolean)
    const ordered = DISPLAY_ORDER.filter((l) => mapped.includes(l))
    return ordered.length ? ordered : ['AM']
  })

  const defaultLang = computed<Lang>(
    () => CODE_TO_LANG[rs.restaurant?.defaultLanguage as LangCode] ?? languages.value[0],
  )

  // Effective language: the user's choice if still enabled, else the default.
  const lang = computed<Lang>(() =>
    languages.value.includes(selected.value) ? selected.value : defaultLang.value,
  )

  // How the public switcher labels a language — chosen by the tenant in the
  // admin (Languages tab). Unknown/absent values fall back to letters, so an
  // older API response keeps the original look.
  const langDisplay = computed<'text' | 'flag'>(() =>
    rs.restaurant?.languageDisplay === 'flag' ? 'flag' : 'text',
  )

  /** The label a switcher renders for a language: 'AM' or '🇦🇲'. */
  const langLabel = (l: Lang): string => (langDisplay.value === 'flag' ? LANG_FLAG[l] : l)

  const setLang = (next: Lang) => {
    if (languages.value.includes(next)) selected.value = next
  }

  // Resolve a localized string for the effective language.
  const t = (text: LocalizedText) => text[lang.value]

  return { lang, languages, defaultLang, langDisplay, langLabel, setLang, t }
}
