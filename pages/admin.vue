<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// Universal Admin Panel — ONE panel for every restaurant and every theme.
// All data flows through the service layer (~/services). The public themes
// consume the same normalized data, so nothing here is theme-specific.
// ─────────────────────────────────────────────────────────────────────────
import {
  categoryService,
  productService,
  uploadService,
  menuService,
  restaurantService,
  type CategoryDraft,
  type ProductDraft,
} from '~/services'
import type { ThemeId } from '~/models/types'

// The admin manages exactly one restaurant — the signed-in owner's tenant.
// The id/slug are NEVER hardcoded; they come from the loaded restaurant
// (API mode → JWT tenant, mock mode → seed).
const menuStore = useMenuStore()
import type { Category, Product, SectionType, Badge, LangCode } from '~/models/types'

// ── auth (only enforced when the real API is enabled) ───────────
const cfg = useRuntimeConfig()
const apiMode = computed(() => cfg.public.useApi as boolean)
const auth = useAuthStore()
const needsLogin = ref(false)
const login = reactive({ email: '', password: '' })
const loginError = ref('')
const loggingIn = ref(false)

useHead({ title: 'Admin · QR Menu' })

const rs = useRestaurantStore()
const { restaurant, settings, themeSettings, themes } = storeToRefs(rs)

// ── navigation ─────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'restaurant', label: 'Restaurant Info', icon: '🏠' },
  { id: 'menu', label: 'Menu Builder', icon: '🗂' },
  { id: 'products', label: 'Products', icon: '🍽' },
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'customize', label: 'Customization', icon: '🎛' },
  { id: 'languages', label: 'Languages', icon: '🌐' },
  { id: 'qr', label: 'QR Code', icon: '▣' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
] as const
const active = ref<(typeof NAV)[number]['id']>('dashboard')
const sidebarOpen = ref(false)

// ── data (loaded via services) ─────────────────────────────────
const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const busy = ref(false)
// Gates the whole admin shell: nothing renders until the real tenant is loaded,
// so a stale/seed restaurant is never flashed on refresh.
const pageReady = ref(false)
const toast = ref('')
const flash = (m: string) => {
  toast.value = m
  setTimeout(() => (toast.value = ''), 2000)
}

const refresh = async () => {
  ;[categories.value, products.value] = await Promise.all([
    categoryService.getCategories(),
    productService.getProducts(),
  ])
}

const loadAll = async () => {
  busy.value = true
  // 1) Resolve the tenant identity — REQUIRED to render the shell. If this
  //    fails (bad/expired token), fall back to the login gate, never a loader.
  try {
    await rs.load()
  } catch (e) {
    busy.value = false
    console.error('Failed to load restaurant', e)
    if (apiMode.value) needsLogin.value = true
    return
  }
  // 2) Best-effort data loads — failures show a toast but must NOT block the UI.
  try {
    const rid = restaurant.value.id
    const slug = restaurant.value.slug
    try {
      const m = await menuService.getMenu(slug || rid)
      if (m) menuStore.setTenant(rid, m)
    } catch {
      /* menu preview is non-critical */
    }
    try {
      await refresh()
    } catch (e) {
      console.error('Failed to load menu data', e)
      flash('Չհաջողվեց բեռնել մենյուն')
    }
  } finally {
    pageReady.value = true // always reveal the shell once identity is known
    busy.value = false
  }
}

const doLogin = async () => {
  loginError.value = ''
  loggingIn.value = true
  try {
    await auth.login(login.email.trim(), login.password)
    needsLogin.value = false
    await loadAll()
  } catch (e) {
    loginError.value = (e as Error)?.message || 'Մուտքը ձախողվեց'
  } finally {
    loggingIn.value = false
  }
}

const doLogout = async () => {
  await auth.logout()
  pageReady.value = false
  needsLogin.value = true
  categories.value = []
  products.value = []
}

onMounted(async () => {
  if (apiMode.value) {
    await auth.init()
    if (!auth.isAuthenticated) {
      needsLogin.value = true
      return
    }
  }
  await loadAll()
})

// ── derived ────────────────────────────────────────────────────
const SECTIONS: { id: SectionType; label: string; icon: string }[] = [
  { id: 'food', label: 'Ուտեստներ', icon: '🍽️' },
  { id: 'drinks', label: 'Ըմպելիքներ', icon: '🥤' },
  { id: 'alcohol', label: 'Ալկոհոլ', icon: '🍷' },
]
const stats = computed(() => ({
  products: products.value.length,
  categories: categories.value.length,
  active: products.value.filter((p) => p.available).length,
}))
const categoryName = (id: string) => categories.value.find((c) => c.id === id)?.name.hy ?? '—'
const publicUrl = computed(
  () => `https://${settings.value.subdomain || restaurant.value.slug}.yourdomain.am`,
)
const qrImage = computed(
  () =>
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(publicUrl.value)}`,
)

// ── filters ────────────────────────────────────────────────────
const menuSection = ref<SectionType>('food')
const prodSection = ref<SectionType | 'all'>('all')
const prodSearch = ref('')
const visibleCategories = computed(() =>
  categories.value.filter((c) => c.section === menuSection.value),
)
const visibleProducts = computed(() => {
  const q = prodSearch.value.trim().toLowerCase()
  return products.value.filter(
    (p) =>
      (prodSection.value === 'all' || p.section === prodSection.value) &&
      (!q || [p.name.hy, p.name.en, p.name.ru].join(' ').toLowerCase().includes(q)),
  )
})

// ── modals + drafts ────────────────────────────────────────────
const blankTr = () => ({ hy: '', en: '', ru: '' })
const BADGES: { id: Badge; label: string }[] = [
  { id: 'hit', label: '🔥 Հիթ' },
  { id: 'new', label: '🆕 Նոր' },
  { id: 'recommended', label: '⭐ Խորհուրդ' },
  { id: 'spicy', label: '🌶 Կծու' },
  { id: 'vegan', label: '🌱 Վեգան' },
  { id: 'affordable', label: '💰 Մատչելի' },
]

const catModal = reactive({ open: false, mode: 'add' as 'add' | 'edit', id: '' })
const catDraft = reactive<CategoryDraft>({
  section: 'food',
  name: blankTr(),
  description: blankTr(),
  icon: '🍽',
  image: '',
  sortOrder: 0,
  active: true,
})
const openAddCategory = () => {
  Object.assign(catDraft, {
    section: menuSection.value,
    name: blankTr(),
    description: blankTr(),
    icon: '🍽',
    image: '',
    sortOrder: visibleCategories.value.length,
    active: true,
  })
  Object.assign(catModal, { open: true, mode: 'add', id: '' })
}
const openEditCategory = (c: Category) => {
  Object.assign(catDraft, {
    section: c.section,
    name: { ...c.name },
    description: { ...c.description },
    icon: c.icon,
    image: c.image,
    sortOrder: c.sortOrder,
    active: c.active,
  })
  Object.assign(catModal, { open: true, mode: 'edit', id: c.id })
}
const submitCategory = async () => {
  busy.value = true
  try {
    if (catModal.mode === 'add') await categoryService.createCategory({ ...catDraft })
    else await categoryService.updateCategory(catModal.id, { ...catDraft })
    await refresh()
    catModal.open = false
    flash('Պահպանված է')
  } finally {
    busy.value = false
  }
}
const removeCategory = async (c: Category) => {
  if (!confirm('Ջնջե՞լ կատեգորիան և դրա ապրանքները։')) return
  await categoryService.deleteCategory(c.id)
  await refresh()
  flash('Ջնջված է')
}

const prodModal = reactive({ open: false, mode: 'add' as 'add' | 'edit', id: '' })
const prodDraft = reactive<ProductDraft>({
  categoryId: '',
  section: 'food',
  name: blankTr(),
  description: blankTr(),
  price: 0,
  image: '',
  badges: [],
  active: true,
  available: true,
  sortOrder: 0,
})
const openAddProduct = () => {
  const firstCat = categories.value[0]
  Object.assign(prodDraft, {
    categoryId: firstCat?.id ?? '',
    section: firstCat?.section ?? 'food',
    name: blankTr(),
    description: blankTr(),
    price: 0,
    image: '',
    badges: [],
    active: true,
    available: true,
    sortOrder: 0,
  })
  Object.assign(prodModal, { open: true, mode: 'add', id: '' })
}
const openEditProduct = (p: Product) => {
  Object.assign(prodDraft, {
    categoryId: p.categoryId,
    section: p.section,
    name: { ...p.name },
    description: { ...p.description },
    price: p.price,
    image: p.image,
    badges: [...p.badges],
    active: p.active,
    available: p.available,
    sortOrder: p.sortOrder,
  })
  Object.assign(prodModal, { open: true, mode: 'edit', id: p.id })
}
// Keep section in sync with the chosen category.
watch(
  () => prodDraft.categoryId,
  (id) => {
    const c = categories.value.find((x) => x.id === id)
    if (c) prodDraft.section = c.section
  },
)
const toggleBadge = (b: Badge) => {
  const i = prodDraft.badges.indexOf(b)
  if (i >= 0) prodDraft.badges.splice(i, 1)
  else prodDraft.badges.push(b)
}
const submitProduct = async () => {
  busy.value = true
  try {
    if (prodModal.mode === 'add') await productService.createProduct({ ...prodDraft })
    else await productService.updateProduct(prodModal.id, { ...prodDraft })
    await refresh()
    prodModal.open = false
    flash('Պահպանված է')
  } finally {
    busy.value = false
  }
}
const removeProduct = async (p: Product) => {
  if (!confirm('Ջնջե՞լ ապրանքը։')) return
  await productService.deleteProduct(p.id)
  await refresh()
  flash('Ջնջված է')
}
const toggleAvailable = async (p: Product) => {
  await productService.setAvailability(p.id, !p.available)
  await refresh()
}

// ── image handling (shared by both drafts) ─────────────────────
const onUpload = async (e: Event, target: { image: string }) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const { url } = await uploadService.uploadImage(file)
  target.image = url
}
const resolving = ref(false)
const onResolve = async (target: { image: string }) => {
  if (!target.image.trim()) return
  resolving.value = true
  try {
    const { url } = await uploadService.resolveImage(target.image)
    target.image = url
  } catch {
    flash('Չհաջողվեց բացել հղումը')
  } finally {
    resolving.value = false
  }
}

// ── theme + settings actions ───────────────────────────────────
const chooseTheme = async (id: string) => {
  await restaurantService.setTheme(restaurant.value.id, id as ThemeId)
  restaurant.value.themeId = id as ThemeId // reflect immediately in the admin
  await rs.saveTheme({ themeId: id as ThemeId })
  flash('Թեման ընտրված է — բացիր կայքը տեսնելու համար')
}
const fmt = (n: number) => n.toLocaleString('hy-AM')
const LANGS: { code: LangCode; label: string }[] = [
  { code: 'hy', label: 'Հայերեն' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
]
const toggleLang = (code: LangCode) => {
  const langs = restaurant.value.activeLanguages
  restaurant.value.activeLanguages = langs.includes(code)
    ? langs.filter((l) => l !== code)
    : [...langs, code]
}
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(publicUrl.value)
    flash('Հղումը պատճենված է')
  } catch {
    flash('Չհաջողվեց պատճենել')
  }
}
const saveRestaurant = async () => {
  await rs.saveRestaurant({ ...restaurant.value })
  flash('Պահպանված է')
}
const saveSettings = async () => {
  await rs.saveSettings({ ...settings.value })
  flash('Պահպանված է')
}
const saveCustomization = async () => {
  await rs.saveTheme({ ...themeSettings.value })
  flash('Պահպանված է')
}
</script>

<template>
  <!-- Login gate (real-API mode only) -->
  <div v-if="needsLogin" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 px-4">
    <form class="w-full max-w-sm rounded-2xl bg-white p-7 shadow-xl" @submit.prevent="doLogin">
      <p class="text-lg font-bold text-slate-900">Admin մուտք</p>
      <p class="mt-1 text-xs text-slate-500">Մուտք գործիր՝ ապրանքները կառավարելու համար</p>
      <label class="mt-5 block text-xs font-semibold text-slate-600">Email</label>
      <input
        v-model="login.email"
        type="email"
        autocomplete="username"
        required
        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        placeholder="owner@tun-lahmajo.test"
      />
      <label class="mt-3 block text-xs font-semibold text-slate-600">Գաղտնաբառ</label>
      <input
        v-model="login.password"
        type="password"
        autocomplete="current-password"
        required
        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        placeholder="••••••••"
      />
      <p v-if="loginError" class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{{ loginError }}</p>
      <button
        type="submit"
        :disabled="loggingIn"
        class="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {{ loggingIn ? 'Մուտք...' : 'Մուտք' }}
      </button>
    </form>
  </div>

  <!-- Loading gate: never paint a stale/seed tenant -->
  <div v-else-if="!pageReady" class="flex min-h-screen items-center justify-center bg-slate-100">
    <div class="flex flex-col items-center gap-3 text-slate-400">
      <span class="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"></span>
      <p class="text-sm">Բեռնվում է…</p>
    </div>
  </div>

  <div v-else class="min-h-screen bg-slate-100 text-slate-800">
    <!-- Top header -->
    <header class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <div class="flex items-center gap-3">
        <button class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" @click="sidebarOpen = !sidebarOpen">☰</button>
        <div>
          <p class="text-sm font-bold text-slate-900">{{ restaurant.name }}</p>
          <p class="text-xs text-slate-500">QR Menu Admin</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="busy" class="text-xs text-slate-400">…</span>
        <NuxtLink :to="`/${restaurant.slug}`" target="_blank" class="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
          View menu ↗
        </NuxtLink>
        <button
          v-if="apiMode && auth.isAuthenticated"
          class="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          @click="doLogout"
        >
          Ելք
        </button>
      </div>
    </header>

    <div class="mx-auto flex max-w-7xl">
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-40 w-60 transform border-r border-slate-200 bg-white pt-16 transition-transform lg:static lg:translate-x-0 lg:pt-0"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <nav class="flex flex-col gap-0.5 p-3">
          <button
            v-for="n in NAV"
            :key="n.id"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition"
            :class="active === n.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'"
            @click="active = n.id; sidebarOpen = false"
          >
            <span class="w-5 text-center" aria-hidden="true">{{ n.icon }}</span>
            {{ n.label }}
          </button>
        </nav>
      </aside>
      <div v-if="sidebarOpen" class="fixed inset-0 z-30 bg-black/30 lg:hidden" @click="sidebarOpen = false" />

      <!-- Main -->
      <main class="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <!-- DASHBOARD -->
        <section v-if="active === 'dashboard'" class="space-y-6">
          <h1 class="text-xl font-bold text-slate-900">Dashboard</h1>
          <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs text-slate-500">Total products</p>
              <p class="mt-1 text-2xl font-bold text-slate-900">{{ stats.products }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs text-slate-500">Categories</p>
              <p class="mt-1 text-2xl font-bold text-slate-900">{{ stats.categories }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs text-slate-500">Available</p>
              <p class="mt-1 text-2xl font-bold text-emerald-600">{{ stats.active }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs text-slate-500">Active theme</p>
              <p class="mt-1 text-2xl font-bold capitalize text-slate-900">{{ restaurant.themeId }}</p>
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <p class="text-xs text-slate-500">QR menu link</p>
            <div class="mt-1 flex items-center gap-3">
              <code class="truncate text-sm text-slate-800">{{ publicUrl }}</code>
              <button class="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold hover:bg-slate-200" @click="copyLink">Copy</button>
            </div>
          </div>
          <div>
            <p class="mb-2 text-sm font-semibold text-slate-700">Quick actions</p>
            <div class="flex flex-wrap gap-2">
              <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700" @click="active = 'products'; openAddProduct()">+ Product</button>
              <button class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50" @click="active = 'menu'; openAddCategory()">+ Category</button>
              <button class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50" @click="active = 'design'">Change theme</button>
            </div>
          </div>
        </section>

        <!-- RESTAURANT INFO -->
        <section v-else-if="active === 'restaurant'" class="max-w-2xl space-y-5">
          <h1 class="text-xl font-bold text-slate-900">Restaurant Info</h1>
          <div class="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label class="block"><span class="lbl">Name</span><input v-model="restaurant.name" class="inp" /></label>
              <label class="block"><span class="lbl">Slug</span><input v-model="restaurant.slug" class="inp" /></label>
            </div>
            <label class="block"><span class="lbl">Tagline (HY)</span><input v-model="restaurant.tagline.hy" class="inp" /></label>
            <div class="grid grid-cols-2 gap-4">
              <label class="block"><span class="lbl">Tagline (EN)</span><input v-model="restaurant.tagline.en" class="inp" /></label>
              <label class="block"><span class="lbl">Tagline (RU)</span><input v-model="restaurant.tagline.ru" class="inp" /></label>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label class="block"><span class="lbl">Phone</span><input v-model="restaurant.phone" class="inp" /></label>
              <label class="block"><span class="lbl">Working hours</span><input v-model="restaurant.workingHours" class="inp" /></label>
            </div>
            <label class="block"><span class="lbl">Address</span><input v-model="restaurant.address" class="inp" /></label>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label class="block"><span class="lbl">Rating</span><input v-model.number="restaurant.rating" type="number" step="0.1" class="inp" /></label>
              <label class="block"><span class="lbl">Instagram</span><input v-model="restaurant.social.instagram" class="inp" /></label>
              <label class="block"><span class="lbl">Facebook</span><input v-model="restaurant.social.facebook" class="inp" /></label>
            </div>
            <button class="btn-primary" @click="saveRestaurant">Save</button>
          </div>
        </section>

        <!-- MENU BUILDER -->
        <section v-else-if="active === 'menu'" class="space-y-5">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-slate-900">Menu Builder</h1>
            <button class="btn-primary" @click="openAddCategory">+ Category</button>
          </div>
          <div class="flex gap-2">
            <button v-for="s in SECTIONS" :key="s.id" class="rounded-full px-4 py-1.5 text-sm font-semibold transition" :class="menuSection === s.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'" @click="menuSection = s.id">{{ s.icon }} {{ s.label }}</button>
          </div>
          <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <p v-if="!visibleCategories.length" class="p-8 text-center text-sm text-slate-400">Կատեգորիա չկա</p>
            <ul v-else class="divide-y divide-slate-100">
              <li v-for="c in visibleCategories" :key="c.id" class="flex items-center gap-3 p-3">
                <span class="text-xl">{{ c.icon }}</span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-slate-900">{{ c.name.hy }}</p>
                  <p class="truncate text-xs text-slate-500">{{ products.filter((p) => p.categoryId === c.id).length }} ապրանք</p>
                </div>
                <button class="icon-btn" @click="openEditCategory(c)">✎</button>
                <button class="icon-btn-danger" @click="removeCategory(c)">🗑</button>
              </li>
            </ul>
          </div>
        </section>

        <!-- PRODUCTS -->
        <section v-else-if="active === 'products'" class="space-y-5">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-slate-900">Products</h1>
            <button class="btn-primary" @click="openAddProduct">+ Product</button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <select v-model="prodSection" class="inp w-auto">
              <option value="all">Բոլորը</option>
              <option v-for="s in SECTIONS" :key="s.id" :value="s.id">{{ s.label }}</option>
            </select>
            <input v-model="prodSearch" placeholder="Որոնել..." class="inp w-auto flex-1" />
          </div>
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full text-sm">
              <thead class="border-b border-slate-100 text-left text-xs text-slate-500">
                <tr>
                  <th class="p-3">Product</th>
                  <th class="p-3">Category</th>
                  <th class="p-3">Price</th>
                  <th class="p-3">Status</th>
                  <th class="p-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="p in visibleProducts" :key="p.id">
                  <td class="p-3">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <img v-if="p.image" :src="p.image" :alt="p.name.hy" class="h-full w-full object-cover" />
                      </div>
                      <span class="font-medium text-slate-900">{{ p.name.hy }}</span>
                    </div>
                  </td>
                  <td class="p-3 text-slate-500">{{ categoryName(p.categoryId) }}</td>
                  <td class="p-3 font-semibold text-slate-900">{{ fmt(p.price) }} ֏</td>
                  <td class="p-3">
                    <button
                      class="rounded-full px-2.5 py-1 text-xs font-bold"
                      :class="p.available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'"
                      @click="toggleAvailable(p)"
                    >{{ p.available ? 'Առկա է' : 'Առկա չէ' }}</button>
                  </td>
                  <td class="p-3">
                    <div class="flex justify-end gap-1">
                      <button class="icon-btn" @click="openEditProduct(p)">✎</button>
                      <button class="icon-btn-danger" @click="removeProduct(p)">🗑</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="!visibleProducts.length" class="p-8 text-center text-sm text-slate-400">Ապրանք չկա</p>
          </div>
        </section>

        <!-- DESIGN -->
        <section v-else-if="active === 'design'" class="space-y-5">
          <h1 class="text-xl font-bold text-slate-900">Design</h1>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="th in themes" :key="th.id" class="overflow-hidden rounded-xl border bg-white" :class="restaurant.themeId === th.id ? 'border-slate-900 ring-2 ring-slate-900' : 'border-slate-200'">
              <div class="flex h-28 items-center justify-center text-2xl font-bold text-white" :style="{ backgroundColor: th.accent }">{{ th.name }}</div>
              <div class="space-y-2 p-4">
                <div class="flex items-center justify-between">
                  <p class="font-bold text-slate-900">{{ th.name }}</p>
                  <span v-if="restaurant.themeId === th.id" class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
                  <span v-else-if="!th.available" class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">Soon</span>
                </div>
                <p class="text-xs text-slate-500">{{ th.description }}</p>
                <p class="text-xs text-slate-400">Best for: {{ th.bestFor }}</p>
                <div class="flex gap-2 pt-1">
                  <NuxtLink :to="`/${restaurant.slug}`" target="_blank" class="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-center text-xs font-semibold hover:bg-slate-50">Preview</NuxtLink>
                  <button :disabled="!th.available" class="flex-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-40" @click="chooseTheme(th.id)">Select</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CUSTOMIZATION -->
        <section v-else-if="active === 'customize'" class="max-w-2xl space-y-5">
          <h1 class="text-xl font-bold text-slate-900">Theme Customization</h1>
          <p class="text-sm text-slate-500">Controlled, theme-safe overrides. Saved per restaurant.</p>
          <div class="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <label class="block"><span class="lbl">Primary</span><input v-model="themeSettings.primaryColor" type="color" class="h-10 w-full rounded-lg border border-slate-300" /></label>
              <label class="block"><span class="lbl">Secondary</span><input v-model="themeSettings.secondaryColor" type="color" class="h-10 w-full rounded-lg border border-slate-300" /></label>
              <label class="block"><span class="lbl">Background</span><input v-model="themeSettings.backgroundColor" type="color" class="h-10 w-full rounded-lg border border-slate-300" /></label>
              <label class="block"><span class="lbl">Accent</span><input v-model="themeSettings.accentColor" type="color" class="h-10 w-full rounded-lg border border-slate-300" /></label>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <label class="block">
                <span class="lbl">Font style</span>
                <select v-model="themeSettings.fontStyle" class="inp">
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                  <option value="editorial">Editorial</option>
                </select>
              </label>
              <label class="block"><span class="lbl">Card radius ({{ themeSettings.cardRadius }}px)</span><input v-model.number="themeSettings.cardRadius" type="range" min="0" max="32" class="mt-3 w-full" /></label>
            </div>
            <div class="space-y-2 border-t border-slate-100 pt-3">
              <label class="flex items-center justify-between text-sm"><span>Show rating</span><input v-model="themeSettings.showRating" type="checkbox" class="h-4 w-4" /></label>
              <label class="flex items-center justify-between text-sm"><span>Show order basket</span><input v-model="themeSettings.showOrderBasket" type="checkbox" class="h-4 w-4" /></label>
              <label class="flex items-center justify-between text-sm"><span>Show favorites</span><input v-model="themeSettings.showFavorites" type="checkbox" class="h-4 w-4" /></label>
              <label class="flex items-center justify-between text-sm"><span>Show product descriptions</span><input v-model="themeSettings.showProductDescriptions" type="checkbox" class="h-4 w-4" /></label>
            </div>
            <button class="btn-primary" @click="saveCustomization">Save</button>
          </div>
        </section>

        <!-- LANGUAGES -->
        <section v-else-if="active === 'languages'" class="max-w-xl space-y-5">
          <h1 class="text-xl font-bold text-slate-900">Languages</h1>
          <div class="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <label class="block">
              <span class="lbl">Default language</span>
              <select v-model="restaurant.defaultLanguage" class="inp">
                <option v-for="l in LANGS" :key="l.code" :value="l.code">{{ l.label }}</option>
              </select>
            </label>
            <div>
              <span class="lbl">Active languages</span>
              <div class="mt-2 flex gap-2">
                <button v-for="l in LANGS" :key="l.code" class="rounded-full px-4 py-1.5 text-sm font-semibold transition" :class="restaurant.activeLanguages.includes(l.code) ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'" @click="toggleLang(l.code)">{{ l.label }}</button>
              </div>
            </div>
            <p class="text-xs text-slate-400">Every category & product stores hy / en / ru, ready for translation.</p>
            <button class="btn-primary" @click="saveRestaurant">Save</button>
          </div>
        </section>

        <!-- QR -->
        <section v-else-if="active === 'qr'" class="max-w-xl space-y-5">
          <h1 class="text-xl font-bold text-slate-900">QR Code</h1>
          <div class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 text-center">
            <img :src="qrImage" alt="QR" class="mx-auto h-52 w-52 rounded-lg border border-slate-200" />
            <code class="block truncate text-sm text-slate-700">{{ publicUrl }}</code>
            <div class="flex justify-center gap-2">
              <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50" @click="copyLink">Copy link</button>
              <a :href="qrImage" download="qr.png" target="_blank" class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Download QR</a>
            </div>
          </div>
        </section>

        <!-- SETTINGS -->
        <section v-else-if="active === 'settings'" class="max-w-2xl space-y-5">
          <h1 class="text-xl font-bold text-slate-900">Settings</h1>
          <div class="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <label class="flex items-center justify-between text-sm">
              <span>Restaurant status (active)</span>
              <input v-model="settings.active" type="checkbox" class="h-4 w-4" />
            </label>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label class="block"><span class="lbl">Subdomain</span><input v-model="settings.subdomain" class="inp" /></label>
              <label class="block"><span class="lbl">Custom domain</span><input v-model="settings.customDomain" placeholder="menu.example.am" class="inp" /></label>
            </div>
            <label class="block"><span class="lbl">SEO title (HY)</span><input v-model="settings.seoTitle.hy" class="inp" /></label>
            <label class="block"><span class="lbl">SEO description (HY)</span><input v-model="settings.seoDescription.hy" class="inp" /></label>
            <div class="grid grid-cols-2 gap-4">
              <label class="block"><span class="lbl">Currency</span><input v-model="settings.currency" class="inp" /></label>
              <label class="block"><span class="lbl">Service %</span><input v-model.number="settings.servicePercent" type="number" class="inp" /></label>
            </div>
            <button class="btn-primary" @click="saveSettings">Save</button>
          </div>
        </section>
      </main>
    </div>

    <!-- Toast -->
    <Transition name="t">
      <div v-if="toast" class="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg">{{ toast }}</div>
    </Transition>

    <!-- Category modal -->
    <AdminModal v-if="catModal.open" :title="(catModal.mode === 'add' ? 'Add' : 'Edit') + ' category'" @close="catModal.open = false">
      <div class="space-y-4">
        <div class="flex gap-3">
          <label class="block w-24"><span class="lbl">Icon</span><input v-model="catDraft.icon" maxlength="4" class="inp text-center text-xl" /></label>
          <label class="block flex-1"><span class="lbl">Section</span>
            <select v-model="catDraft.section" class="inp">
              <option v-for="s in SECTIONS" :key="s.id" :value="s.id">{{ s.label }}</option>
            </select>
          </label>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label class="block"><span class="lbl">Name HY</span><input v-model="catDraft.name.hy" class="inp" /></label>
          <label class="block"><span class="lbl">Name EN</span><input v-model="catDraft.name.en" class="inp" /></label>
          <label class="block"><span class="lbl">Name RU</span><input v-model="catDraft.name.ru" class="inp" /></label>
        </div>
        <label class="flex items-center justify-between text-sm"><span>Active</span><input v-model="catDraft.active" type="checkbox" class="h-4 w-4" /></label>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="catModal.open = false">Cancel</button>
        <button class="btn-primary" @click="submitCategory">Save</button>
      </template>
    </AdminModal>

    <!-- Product modal -->
    <AdminModal v-if="prodModal.open" :title="(prodModal.mode === 'add' ? 'Add' : 'Edit') + ' product'" @close="prodModal.open = false">
      <div class="space-y-4">
        <label class="block"><span class="lbl">Category</span>
          <select v-model="prodDraft.categoryId" class="inp">
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.icon }} {{ c.name.hy }}</option>
          </select>
        </label>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label class="block"><span class="lbl">Name HY</span><input v-model="prodDraft.name.hy" class="inp" /></label>
          <label class="block"><span class="lbl">Name EN</span><input v-model="prodDraft.name.en" class="inp" /></label>
          <label class="block"><span class="lbl">Name RU</span><input v-model="prodDraft.name.ru" class="inp" /></label>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label class="block"><span class="lbl">Desc HY</span><input v-model="prodDraft.description.hy" class="inp" /></label>
          <label class="block"><span class="lbl">Desc EN</span><input v-model="prodDraft.description.en" class="inp" /></label>
          <label class="block"><span class="lbl">Desc RU</span><input v-model="prodDraft.description.ru" class="inp" /></label>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <label class="block"><span class="lbl">Price (֏)</span><input v-model.number="prodDraft.price" type="number" class="inp" /></label>
          <label class="flex items-center justify-between gap-2 self-end pb-2 text-sm"><span>Available</span><input v-model="prodDraft.available" type="checkbox" class="h-4 w-4" /></label>
        </div>
        <div>
          <span class="lbl">Badges</span>
          <div class="mt-1.5 flex flex-wrap gap-2">
            <button v-for="b in BADGES" :key="b.id" type="button" class="rounded-full px-3 py-1 text-xs font-semibold transition" :class="prodDraft.badges.includes(b.id) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'" @click="toggleBadge(b.id)">{{ b.label }}</button>
          </div>
        </div>
        <div>
          <span class="lbl">Image</span>
          <div class="mt-1.5 flex items-center gap-3">
            <div class="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <img v-if="prodDraft.image" :src="prodDraft.image" alt="" class="h-full w-full object-cover" />
            </div>
            <div class="flex-1">
              <div class="flex gap-2">
                <input v-model="prodDraft.image" placeholder="Image / page / Google link" class="inp" />
                <button type="button" :disabled="resolving" class="shrink-0 rounded-lg bg-slate-700 px-3 text-sm font-semibold text-white disabled:opacity-50" @click="onResolve(prodDraft)">{{ resolving ? '…' : 'Open' }}</button>
              </div>
              <label class="mt-1.5 inline-block cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-800">
                Upload file
                <input type="file" accept="image/*" class="hidden" @change="(e) => onUpload(e, prodDraft)" />
              </label>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="prodModal.open = false">Cancel</button>
        <button class="btn-primary" @click="submitProduct">Save</button>
      </template>
    </AdminModal>
  </div>
</template>

<style scoped>
.lbl {
  @apply mb-1 block text-xs font-semibold text-slate-500;
}
.inp {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900;
}
.btn-primary {
  @apply rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700;
}
.btn-ghost {
  @apply rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50;
}
.icon-btn {
  @apply rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800;
}
.icon-btn-danger {
  @apply rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600;
}
.t-enter-active,
.t-leave-active {
  transition: opacity 0.2s ease;
}
.t-enter-from,
.t-leave-to {
  opacity: 0;
}
</style>
