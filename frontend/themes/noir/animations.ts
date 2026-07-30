// ─────────────────────────────────────────────────────────────────────────
// Noir theme — animation system
//
// Motion for Noir is deliberately slow and weightless: surfaces settle rather
// than bounce. Named <Transition> keys live in styles/noir.css; this file owns
// the easing constant and the scroll-reveal directive.
// ─────────────────────────────────────────────────────────────────────────
import type { Directive } from 'vue'

/** Signature easing — a long, confident settle. */
export const noirEase = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Named Vue <Transition> groups (CSS defined in styles/noir.css). */
export const noirTransitions = {
  fade: 'nr-fade',
  drawer: 'nr-drawer',
  dock: 'nr-dock',
  modal: 'nr-modal',
} as const

/**
 * v-reveal — adds `.is-in` once the element scrolls into view, driving the
 * fade-up defined in styles/noir.css. Optional stagger: `v-reveal="3"`.
 */
type RevealEl = HTMLElement & {
  _nrIo?: IntersectionObserver
  _nrTimer?: ReturnType<typeof setTimeout>
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el: RevealEl, binding) {
    const delay = typeof binding.value === 'number' ? binding.value : 0
    el.style.setProperty('--nr-reveal-delay', `${Math.min(delay, 8) * 55}ms`)
    el.classList.add('nr-reveal')

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
      { threshold: 0.01, rootMargin: '0px 0px 5% 0px' },
    )
    io.observe(el)
    el._nrIo = io
    // Safety net: never leave content hidden if the observer never fires.
    el._nrTimer = setTimeout(reveal, 1600 + Math.min(delay, 8) * 55)
  },
  unmounted(el: RevealEl) {
    el._nrIo?.disconnect()
    if (el._nrTimer) clearTimeout(el._nrTimer)
  },
}
