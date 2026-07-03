import type { Theme } from '~/models/types'
import { THEMES } from '~/data/themeCatalog'

/** Theme catalog shown in the admin's Design section. Selection is persisted
 *  server-side via restaurantService.setTheme (PATCH /admin/restaurant/theme). */
export const themeService = {
  async getThemes(): Promise<Theme[]> {
    return THEMES
  },

  async getTheme(themeId: string): Promise<Theme | null> {
    return THEMES.find((t) => t.id === themeId) ?? null
  },
}
