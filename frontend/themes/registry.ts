import type { Component } from 'vue'
import DesignAria from '~/components/DesignAria.vue'
import DesignHeritage from '~/components/DesignHeritage.vue'
import AtelierMenu from '~/themes/atelier/layouts/AtelierMenu.vue'
import MaisonExperience from '~/themes/maison/layouts/MaisonExperience.vue'
import NoirMenu from '~/themes/noir/layouts/NoirMenu.vue'
import OpalineMenu from '~/themes/opaline/layouts/OpalineMenu.vue'

// Theme registry — themeId → root component. No switch statements anywhere
// else in the app; ThemeRenderer reads from here. Add new themes in one place.
export const themeRegistry: Record<string, Component> = {
  aria: DesignAria,
  atelier: AtelierMenu,
  maison: MaisonExperience,
  heritage: DesignHeritage,
  noir: NoirMenu,
  opaline: OpalineMenu,
}

export const FALLBACK_THEME: Component = DesignAria

export const getThemeComponent = (themeId: string): Component =>
  themeRegistry[themeId] ?? FALLBACK_THEME
