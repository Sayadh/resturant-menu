// ─────────────────────────────────────────────────────────────────────────
// Atelier theme — animation system
//
// Centralises the motion language for the Atelier design: named <Transition>
// keys (their CSS lives in styles/atelier.css), easing curves, and a small
// scroll-reveal directive so editorial sections fade/rise into view as the
// guest scrolls. Keeping motion in one place keeps the theme cohesive.
// ─────────────────────────────────────────────────────────────────────────
import type { Directive } from 'vue'

/** Signature easing — a slow, confident "settle". */
export const atelierEase = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Named Vue <Transition> groups (CSS defined in styles/atelier.css). */
export const atelierTransitions = {
  /** Backdrop fade for overlays. */
  fade: 'atl-fade',
  /** Right-docked bill drawer (slides from edge). */
  drawer: 'atl-drawer',
  /** Bottom basket pill. */
  dock: 'atl-dock',
  /** Detail modal — rise + fade. */
  modal: 'atl-modal',
  /** Cross-fade when switching menu sections. */
  section: 'atl-section',
} as const

/**
 * v-reveal — adds `.is-revealed` once the element scrolls into view, driving
 * the editorial fade-up defined in styles/atelier.css. Supports an optional
 * stagger index via the binding value: `v-reveal="3"`.
 */
type RevealEl = HTMLElement & {
  _atlIo?: IntersectionObserver
  _atlTimer?: ReturnType<typeof setTimeout>
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el: RevealEl, binding) {
    const delay = typeof binding.value === 'number' ? binding.value : 0
    el.style.setProperty('--atl-reveal-delay', `${Math.min(delay, 8) * 60}ms`)
    el.classList.add('atl-reveal')

    const reveal = () => el.classList.add('is-revealed')

    if (typeof IntersectionObserver === 'undefined') {
      reveal()
      return
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal()
            obs.unobserve(entry.target)
          }
        }
      },
      // Generous margins so elements near the very bottom of the page still
      // trigger; threshold 0.01 means "any sliver visible".
      { threshold: 0.01, rootMargin: '0px 0px 5% 0px' },
    )
    io.observe(el)
    el._atlIo = io
    // Safety net: never leave content hidden if the observer never fires
    // (e.g. last sections on a short page that can't scroll far enough).
    el._atlTimer = setTimeout(reveal, 1600 + Math.min(delay, 8) * 60)
  },
  unmounted(el: RevealEl) {
    el._atlIo?.disconnect()
    if (el._atlTimer) clearTimeout(el._atlTimer)
  },
}
