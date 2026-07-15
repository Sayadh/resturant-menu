// AI helpers (Professional/Business only — enforced by the backend).
// translate: fill the other languages from one filled language.
// describe: generate an appetizing description from a product name.
import { useApiClient } from './http'

type Lang = 'hy' | 'ru' | 'en'

export const aiService = {
  async translate(text: string, source: Lang, targets: Lang[]): Promise<Record<Lang, string>> {
    const api = useApiClient()
    const r = await api.post<{ translations: Record<Lang, string> }>('/ai/translate', {
      text,
      source,
      targets,
    })
    return r.translations ?? ({} as Record<Lang, string>)
  },

  async describe(name: string, langs: Lang[]): Promise<Record<Lang, string>> {
    const api = useApiClient()
    const r = await api.post<{ descriptions: Record<Lang, string> }>('/ai/describe', { name, langs })
    return r.descriptions ?? ({} as Record<Lang, string>)
  },
}
