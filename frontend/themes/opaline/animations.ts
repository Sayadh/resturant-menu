// ─────────────────────────────────────────────────────────────────────────
// Opaline theme — animation system
//
// Motion in Opaline is short, soft and paper-like: things rise a few pixels
// and settle. Named <Transition> keys live in styles/opaline.css; this file
// owns the easing constant and the scroll-reveal directive.
// ─────────────────────────────────────────────────────────────────────────
import type { Directive } from 'vue'

/** Signature easing — a quick, quiet settle. */
export const opalineEase = 'cubic-bezier(0.16, 1, 0.3, 1)'

/** Named Vue <Transition> groups (CSS defined in styles/opaline.css). */
export const opalineTransitions = {
  fade: 'op-fade',
  page: 'op-page',
  drawer: 'op-drawer',
  dock: 'op-dock',
  modal: 'op-modal',
} as const

/**
 * v-reveal — adds `.is-in` once the element scrolls into view, driving the
 * fade-up defined in styles/opaline.css. Optional stagger: `v-reveal="3"`.
 * Purely presentational; it never touches data or state.
 */
type RevealEl = HTMLElement & {
  _opIo?: IntersectionObserver
  _opTimer?: ReturnType<typeof setTimeout>
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el: RevealEl, binding) {
    const delay = typeof binding.value === 'number' ? binding.value : 0
    el.style.setProperty('--op-reveal-delay', `${Math.min(delay, 8) * 45}ms`)
    el.classList.add('op-reveal')

    const reveal = () => el.classList.add('is-in')

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
      { threshold: 0.01, rootMargin: '0px 0px 6% 0px' },
    )
    io.observe(el)
    el._opIo = io
    // Safety net: never leave content hidden if the observer never fires.
    el._opTimer = setTimeout(reveal, 1400 + Math.min(delay, 8) * 45)
  },
  unmounted(el: RevealEl) {
    el._opIo?.disconnect()
    if (el._opTimer) clearTimeout(el._opTimer)
  },
}
