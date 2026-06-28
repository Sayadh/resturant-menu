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
export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    const delay = typeof binding.value === 'number' ? binding.value : 0
    el.style.setProperty('--atl-reveal-delay', `${Math.min(delay, 8) * 60}ms`)
    el.classList.add('atl-reveal')

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-revealed')
      return
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            obs.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    ;(el as HTMLElement & { _atlIo?: IntersectionObserver })._atlIo = io
  },
  unmounted(el) {
    ;(el as HTMLElement & { _atlIo?: IntersectionObserver })._atlIo?.disconnect()
  },
}
