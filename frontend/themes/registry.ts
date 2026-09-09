import { defineAsyncComponent, type Component } from 'vue'

// ─────────────────────────────────────────────────────────────────────────
// Theme registry — themeId → root component. No switch statements anywhere
// else in the app; ThemeRenderer reads from here. Add new themes in one place.
//
// Every entry is loaded LAZILY: a tenant ships only the theme it renders with.
// Static imports meant a restaurant on Opaline also downloaded Aria, Heritage,
// Atelier, Maison and Noir — five themes of dead code for every guest.
// ─────────────────────────────────────────────────────────────────────────
export const themeRegistry: Record<string, Component> = {
  aria: defineAsyncComponent(() => import('~/components/DesignAria.vue')),
  atelier: defineAsyncComponent(() => import('~/themes/atelier/layouts/AtelierMenu.vue')),
  maison: defineAsyncComponent(() => import('~/themes/maison/layouts/MaisonExperience.vue')),
  heritage: defineAsyncComponent(() => import('~/components/DesignHeritage.vue')),
  noir: defineAsyncComponent(() => import('~/themes/noir/layouts/NoirMenu.vue')),
  opaline: defineAsyncComponent(() => import('~/themes/opaline/layouts/OpalineMenu.vue')),
}

export const FALLBACK_THEME: Component = themeRegistry.aria

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
