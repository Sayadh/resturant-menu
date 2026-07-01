<script setup lang="ts">
// Lightweight scroll-reveal wrapper (no deps). Adds `.is-in` when the element
// enters the viewport, driving a CSS transition. `delay` staggers children.
const props = withDefaults(defineProps<{ delay?: number; as?: string; y?: number }>(), {
  delay: 0,
  as: 'div',
  y: 24,
})

const el = ref<HTMLElement | null>(null)
const shown = ref(false)

onMounted(() => {
  if (!el.value || typeof IntersectionObserver === 'undefined') {
    shown.value = true
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          shown.value = true
          io.disconnect()
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  )
  io.observe(el.value)
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <component
    :is="props.as"
    ref="el"
    class="reveal"
    :class="{ 'is-in': shown }"
    :style="{ '--rv-delay': `${props.delay}ms`, '--rv-y': `${props.y}px` }"
  >
    <slot />
  </component>
</template>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(var(--rv-y, 24px));
  transition:
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) var(--rv-delay, 0ms),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) var(--rv-delay, 0ms);
  will-change: opacity, transform;
}
.reveal.is-in {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
