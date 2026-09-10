import type { Component } from 'vue'
import DesignAria from '~/components/DesignAria.vue'
import DesignHeritage from '~/components/DesignHeritage.vue'
import AtelierMenu from '~/themes/atelier/layouts/AtelierMenu.vue'
import MaisonExperience from '~/themes/maison/layouts/MaisonExperience.vue'
import NoirMenu from '~/themes/noir/layouts/NoirMenu.vue'
import OpalineMenu from '~/themes/opaline/layouts/OpalineMenu.vue'

// ─────────────────────────────────────────────────────────────────────────
// Theme registry — themeId → root component. No switch statements anywhere
// else in the app; ThemeRenderer reads from here. Add new themes in one place.
//
// These are STATIC on purpose. Splitting them with defineAsyncComponent ships
// less code per tenant, but the client then has no chunk at hydration time
// while the server rendered the full theme, and the page can stay on its
// loader. Revisit only with a way to preload the active theme's chunk.
// ─────────────────────────────────────────────────────────────────────────
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

// ── theme typography ─────────────────────────────────────────────────────
// Aria, Heritage, Atelier, Maison and Noir render through Tailwind's `serif`
// and `display` families (Cormorant Garamond / Cinzel — see tailwind.config).
// Opaline sets its own faces in OpalineMenu, so loading these for it costs a
// guest three extra families, one of them in ten variants, for nothing.
const DISPLAY_FONTS =
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700' +
  '&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500' +
  '&family=Noto+Serif+Armenian:wght@400;500;600;700&display=swap'

/** The font stylesheet a tenant page must load, or null when the theme owns it. */
export const themeFontsHref = (themeId: string): string | null =>
  themeId === 'opaline' ? null : DISPLAY_FONTS
