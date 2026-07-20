<script setup lang="ts">
// Design preview: /demo?theme=aria renders a sample menu ("Your restaurant")
// in the chosen theme. No tenant data, not indexed.
import { demoRestaurant, demoLevels, demoCategories } from '~/data/demoMenu'

const route = useRoute()
const VALID = ['aria', 'atelier', 'maison', 'heritage', 'noir']
const themeId = computed(() => {
  const q = String(route.query.theme || '').toLowerCase()
  return (VALID.includes(q) ? q : 'aria') as typeof demoRestaurant.themeId
})
const displayRestaurant = computed(() => ({ ...demoRestaurant, themeId: themeId.value }))

useHead({
  title: 'Դիզայնի նախադիտում | menus.am',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  link: [
    { rel: 'canonical', href: 'https://menus.am/demo' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Noto+Serif+Armenian:wght@400;500;600;700&display=swap',
    },
  ],
})
</script>

<template>
  <ClientOnly>
    <ThemeRenderer :restaurant="displayRestaurant" :levels="demoLevels" :categories="demoCategories" />
    <template #fallback>
      <MenuLoading />
    </template>
  </ClientOnly>
</template>
