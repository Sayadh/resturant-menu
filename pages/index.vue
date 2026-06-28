<script setup lang="ts">
// The page is a thin shell: it renders the currently selected design and the
// floating design switcher. Each design is a self-contained component with its
// own layout + logic, all reading from the shared menu store.
import type { Component } from 'vue'
import DesignHeritage from '~/components/DesignHeritage.vue'
import DesignAria from '~/components/DesignAria.vue'
import AtelierMenu from '~/themes/atelier/layouts/AtelierMenu.vue'

// Registry: map a design id → its root component.
// To add a design: create its root component, import it here, add it to the
// map, and add its metadata to composables/useDesign.ts. Themes can live in
// their own self-contained folder (e.g. themes/atelier/) or in components/.
const registry: Record<string, Component> = {
  aria: DesignAria,
  atelier: AtelierMenu,
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
