import type { Lang, LocalizedText } from '~/data/menu'

export const languages: Lang[] = ['AM', 'EN', 'RU']

export const useLanguage = () => {
  const lang = useState<Lang>('lang', () => 'AM')

  const setLang = (next: Lang) => {
    lang.value = next
  }

  // Resolve a localized string for the current language.
  const t = (text: LocalizedText) => text[lang.value]

  return { lang, languages, setLang, t }
}
