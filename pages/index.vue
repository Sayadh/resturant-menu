<script setup lang="ts">
// The page is a thin shell: it renders the currently selected design and the
// floating design switcher. Each design is a self-contained component with its
// own layout + logic, all reading from the shared menu store.
import type { Component } from 'vue'
import DesignHeritage from '~/components/DesignHeritage.vue'

// Registry: map a design id → its root component.
// To add a design: create components/DesignX.vue, import it here, add it to the
// map, and add its metadata to composables/useDesign.ts.
const registry: Record<string, Component> = {
  heritage: DesignHeritage,
}

const { activeDesign } = useDesign()
const current = computed(() => registry[activeDesign.value] ?? DesignHeritage)
</script>

<template>
  <div>
    <component :is="current" />
    <DesignSwitcher />
  </div>
</template>
