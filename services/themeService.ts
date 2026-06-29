import type { Theme, ThemeSettings } from '~/models/types'
import { delay, dbRead, dbWrite } from './db'
import { seedThemeSettings, THEMES } from './seed'

const T_KEY = 'qrmenu:theme-settings'

/**
 * Theme catalog + the restaurant's selected theme & controlled customization.
 * Future endpoints: GET /themes, GET/PATCH /restaurant/theme.
 */
export const themeService = {
  async getThemes(): Promise<Theme[]> {
    await delay()
    return THEMES
  },

  // GET /api/themes/:id
  async getTheme(themeId: string): Promise<Theme | null> {
    await delay()
    return THEMES.find((t) => t.id === themeId) ?? null
  },

  async getThemeSettings(): Promise<ThemeSettings> {
    await delay()
    return dbRead<ThemeSettings>(T_KEY, seedThemeSettings)
  },

  async updateTheme(patch: Partial<ThemeSettings>): Promise<ThemeSettings> {
    await delay()
    const next = { ...dbRead<ThemeSettings>(T_KEY, seedThemeSettings), ...patch }
    dbWrite(T_KEY, next)
    return next
  },
}
