// ─────────────────────────────────────────────────────────────────────────
// Maison theme — animation system
//
// Centralises the motion language for the Maison experience: a scroll-reveal
// directive (fade + rise, with optional stagger), a lightweight parallax
// directive for hero/section imagery, named <Transition> keys (CSS lives in
// styles/maison.css) and the signature easing curve. Premium and quiet —
// fade, scale, parallax, reveal. No flashy effects.
// ─────────────────────────────────────────────────────────────────────────
import type { Directive } from 'vue'

/** Signature easing — a slow, confident settle. */
export const maisonEase = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Named Vue <Transition> groups (CSS defined in styles/maison.css). */
export const maisonTransitions = {
  fade: 'ms-fade', // backdrops / overlays
  drawer: 'ms-drawer', // right-docked selection drawer
  dock: 'ms-dock', // floating basket pill
  modal: 'ms-modal', // detail / search panels
  veil: 'ms-veil', // welcome veil lift
} as const

interface RevealOpts {
  delay?: number
  y?: number
}

/**
 * v-reveal — adds `.is-in` once the element scrolls into view, driving the
 * editorial fade-up defined in styles/maison.css. Accepts an optional stagger
 * index (`v-reveal="3"`) or an options object (`v-reveal="{ delay: 2, y: 40 }"`).
 */
export const vReveal: Directive<HTMLElement, number | RevealOpts | undefined> = {
  mounted(el, binding) {
    const opts: RevealOpts =
      typeof binding.value === 'number'
        ? { delay: binding.value }
        : (binding.value ?? {})
    const delay = Math.min(opts.delay ?? 0, 10)
    el.style.setProperty('--ms-reveal-delay', `${delay * 70}ms`)
    if (typeof opts.y === 'number') el.style.setProperty('--ms-reveal-y', `${opts.y}px`)
    el.classList.add('ms-reveal')

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            obs.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    ;(el as HTMLElement & { _msIo?: IntersectionObserver })._msIo = io
  },
  unmounted(el) {
    ;(el as HTMLElement & { _msIo?: IntersectionObserver })._msIo?.disconnect()
  },
}

/**
 * v-parallax — subtle vertical parallax on scroll. The bound value is the
 * intensity (px of travel across the viewport, default 40). Respects reduced
 * motion and uses a single rAF-throttled scroll listener per element.
 */
export const vParallax: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (
      typeof window === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    const intensity = typeof binding.value === 'number' ? binding.value : 40
    let ticking = false
    const update = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // progress: -1 (below) → 1 (above) as the element passes through view.
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh
      el.style.transform = `translate3d(0, ${(-progress * intensity).toFixed(2)}px, 0)`
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    ;(el as HTMLElement & { _msPx?: () => void })._msPx = () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  },
  unmounted(el) {
    ;(el as HTMLElement & { _msPx?: () => void })._msPx?.()
  },
}
