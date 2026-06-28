<script setup lang="ts">
import {
  drinkGroups,
  badgeLabels,
  type DrinkGroup,
  type BadgeKey,
  type LocalizedText,
  type MenuCategory,
  type MenuItem,
} from '~/data/menu'

useHead({ title: 'Ադմին · TUN LAHMAJO' })

const store = useMenuStore()
const { levels, categories } = storeToRefs(store)

// ── view state ─────────────────────────────────────────────────
const activeLevel = ref<string>(levels.value[0]?.id ?? 'food')
const activeGroup = ref<DrinkGroup>('soft')
const expanded = ref<string | null>(null)

const isDrinks = computed(() => activeLevel.value === 'drinks')
const visibleCategories = computed(() =>
  store.categoriesOf(activeLevel.value, activeGroup.value),
)

const levelTitle = (id: string) => levels.value.find((l) => l.id === id)?.title.AM ?? id

// ── modal + form ───────────────────────────────────────────────
const blankLT = (): LocalizedText => ({ AM: '', EN: '', RU: '' })

type ModalType = 'level' | 'category' | 'product'
const modal = reactive({
  open: false,
  type: 'category' as ModalType,
  mode: 'add' as 'add' | 'edit',
  categoryId: '',
  editId: '',
})

const form = reactive({
  icon: '🍽',
  title: blankLT(),
  level: 'food',
  group: 'soft' as DrinkGroup,
  name: blankLT(),
  description: blankLT(),
  price: 0,
  image: '',
  badge: '' as '' | BadgeKey,
  available: true,
})

const resetForm = () => {
  form.icon = '🍽'
  form.title = blankLT()
  form.level = activeLevel.value
  form.group = activeGroup.value
  form.name = blankLT()
  form.description = blankLT()
  form.price = 0
  form.image = ''
  form.badge = ''
  form.available = true
}

const closeModal = () => {
  modal.open = false
}

// ── open helpers ───────────────────────────────────────────────
const openAddLevel = () => {
  resetForm()
  Object.assign(modal, { open: true, type: 'level', mode: 'add' })
}
const openEditLevel = (id: string) => {
  const lvl = levels.value.find((l) => l.id === id)
  if (!lvl) return
  resetForm()
  form.icon = lvl.icon
  form.title = { ...lvl.title }
  Object.assign(modal, { open: true, type: 'level', mode: 'edit', editId: id })
}

const openAddCategory = () => {
  resetForm()
  form.level = activeLevel.value
  form.group = activeGroup.value
  Object.assign(modal, { open: true, type: 'category', mode: 'add' })
}
const openEditCategory = (cat: MenuCategory) => {
  resetForm()
  form.icon = cat.icon
  form.title = { ...cat.title }
  form.level = cat.level
  form.group = cat.group ?? 'soft'
  Object.assign(modal, { open: true, type: 'category', mode: 'edit', editId: cat.id })
}

const openAddProduct = (categoryId: string) => {
  resetForm()
  Object.assign(modal, { open: true, type: 'product', mode: 'add', categoryId })
}
const openEditProduct = (categoryId: string, item: MenuItem) => {
  resetForm()
  form.name = { ...item.name }
  form.description = { ...item.description }
  form.price = item.price
  form.image = item.image
  form.badge = item.badge ?? ''
  form.available = item.available !== false
  Object.assign(modal, { open: true, type: 'product', mode: 'edit', categoryId, editId: item.id })
}

// ── submit ─────────────────────────────────────────────────────
const submit = async () => {
  if (modal.type === 'level') {
    const payload = { icon: form.icon, title: { ...form.title } }
    if (modal.mode === 'add') store.addLevel(payload)
    else store.updateLevel(modal.editId, payload)
  } else if (modal.type === 'category') {
    const payload = {
      level: form.level,
      group: form.group,
      icon: form.icon,
      title: { ...form.title },
    }
    if (modal.mode === 'add') store.addCategory(payload)
    else store.updateCategory(modal.editId, payload)
  } else {
    // Resolve a pasted page/Google link into a direct image before saving.
    try {
      form.image = await normalizeImage(form.image)
    } catch {
      /* leave as typed; the card falls back to a category tile if it can't load */
    }
    const payload = {
      name: { ...form.name },
      description: { ...form.description },
      price: Number(form.price) || 0,
      image: form.image,
      badge: form.badge || undefined,
      available: form.available,
    }
    if (modal.mode === 'add') store.addProduct(modal.categoryId, payload)
    else store.updateProduct(modal.categoryId, modal.editId, payload)
  }
  closeModal()
}

// ── delete (with confirm) ──────────────────────────────────────
const confirmRemoveLevel = (id: string) => {
  if (confirm('Ջնջե՞լ բաժինը և դրա բոլոր կատեգորիաները։')) store.removeLevel(id)
}
const confirmRemoveCategory = (id: string) => {
  if (confirm('Ջնջե՞լ կատեգորիան և դրա բոլոր ապրանքները։')) store.removeCategory(id)
}
const confirmRemoveProduct = (categoryId: string, itemId: string) => {
  if (confirm('Ջնջե՞լ ապրանքը։')) store.removeProduct(categoryId, itemId)
}

const confirmReset = () => {
  if (confirm('Վերականգնե՞լ սկզբնական մենյուն (բոլոր փոփոխությունները կջնջվեն)։')) store.reset()
}

// ── image upload ───────────────────────────────────────────────
const onFile = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.image = reader.result as string
  }
  reader.readAsDataURL(file)
}

// ── resolve a pasted link (page / Google) into a direct image ───
const resolving = ref(false)
const resolveError = ref('')

const isDirectImage = (u: string) =>
  /\.(jpe?g|png|webp|gif|avif|svg)(\?|#|$)/i.test(u) ||
  /(i0\.wp\.com|i1\.wp\.com|i2\.wp\.com|images\.unsplash\.com|gstatic\.com|googleusercontent\.com|fbcdn\.net|cdn\.)/i.test(u)

// Google "copy image link" / result URLs embed the real image in a query param.
const extractGoogle = (u: string) => {
  try {
    const url = new URL(u)
    const candidate =
      url.searchParams.get('imgurl') || url.searchParams.get('media') || url.searchParams.get('url') || url.searchParams.get('q')
    if (candidate && /^https?:\/\//i.test(candidate)) return candidate
  } catch {
    /* not a URL */
  }
  return u
}

const normalizeImage = async (raw: string): Promise<string> => {
  let u = (raw || '').trim()
  if (!u || u.startsWith('data:')) return u
  u = extractGoogle(u)
  if (isDirectImage(u)) return u
  // It's a page link — ask the server for its og:image.
  const r = await $fetch<{ image: string }>('/api/resolve-image', { params: { url: u } })
  return r.image
}

const resolveImage = async () => {
  if (!form.image.trim()) return
  resolving.value = true
  resolveError.value = ''
  try {
    form.image = await normalizeImage(form.image)
  } catch {
    resolveError.value = 'Չհաջողվեց ստանալ նկարը այս հղումից։ Փորձիր ուղիղ նկարի հղում (.jpg/.png) կամ վերբեռնիր ֆայլ։'
  } finally {
    resolving.value = false
  }
}

const fmtPrice = (n: number) => n.toLocaleString('hy-AM')
</script>

<template>
  <div class="min-h-screen pb-20">
    <!-- Top bar -->
    <header class="sticky top-0 z-20 border-b border-caramel/25 bg-cream/95 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div>
          <p class="font-display text-lg font-bold uppercase tracking-[0.16em] text-brown">
            TUN LAHMAJO
          </p>
          <p class="font-serif text-sm text-brown-soft">Ադմին վահանակ</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-full border border-caramel/40 bg-white px-3 py-2 text-sm font-semibold text-brown transition hover:border-caramel"
            @click="confirmReset"
          >
            Վերականգնել
          </button>
          <NuxtLink
            to="/"
            class="rounded-full bg-caramel px-4 py-2 text-sm font-semibold text-white shadow-gold transition hover:bg-caramel-dark"
          >
            Դիտել կայքը
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 pt-6">
      <!-- Sections (levels) -->
      <div class="mb-5 flex flex-wrap items-center gap-2">
        <button
          v-for="lvl in levels"
          :key="lvl.id"
          type="button"
          class="group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-wide transition"
          :class="
            activeLevel === lvl.id
              ? 'border-caramel bg-caramel text-white shadow-gold'
              : 'border-caramel/30 bg-white text-brown hover:border-caramel/60'
          "
          @click="activeLevel = lvl.id"
        >
          <span aria-hidden="true">{{ lvl.icon }}</span>
          {{ lvl.title.AM }}
          <span
            class="ml-1 cursor-pointer opacity-60 hover:opacity-100"
            title="Խմբագրել բաժինը"
            @click.stop="openEditLevel(lvl.id)"
            >✎</span
          >
          <span
            v-if="levels.length > 1"
            class="cursor-pointer opacity-60 hover:opacity-100"
            title="Ջնջել բաժինը"
            @click.stop="confirmRemoveLevel(lvl.id)"
            >🗑</span
          >
        </button>
        <button
          type="button"
          class="rounded-full border border-dashed border-caramel/50 px-4 py-2 text-sm font-semibold text-caramel-dark transition hover:bg-caramel/10"
          @click="openAddLevel"
        >
          + Բաժին
        </button>
      </div>

      <!-- Drinks group toggle -->
      <div v-if="isDrinks" class="mb-5 flex items-center gap-2">
        <button
          v-for="grp in drinkGroups"
          :key="grp.id"
          type="button"
          class="rounded-full border px-4 py-1.5 text-sm font-semibold transition"
          :class="
            activeGroup === grp.id
              ? 'border-brown bg-brown text-white'
              : 'border-caramel/30 bg-white text-brown-soft hover:text-brown'
          "
          @click="activeGroup = grp.id"
        >
          {{ grp.icon }} {{ grp.title.AM }}
        </button>
      </div>

      <!-- Add category -->
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-display text-xl font-bold text-brown">
          Կատեգորիաներ
          <span class="font-serif text-sm font-normal text-brown-soft"
            >({{ visibleCategories.length }})</span
          >
        </h2>
        <button
          type="button"
          class="rounded-full bg-brown px-4 py-2 text-sm font-semibold text-white transition hover:bg-brown-light"
          @click="openAddCategory"
        >
          + Կատեգորիա
        </button>
      </div>

      <!-- Category list -->
      <div class="flex flex-col gap-3">
        <p
          v-if="!visibleCategories.length"
          class="rounded-card border border-dashed border-caramel/40 bg-white/60 py-10 text-center font-serif text-brown-soft"
        >
          Կատեգորիա չկա։ Ավելացրու առաջինը։
        </p>

        <div
          v-for="cat in visibleCategories"
          :key="cat.id"
          class="overflow-hidden rounded-card border border-brown/10 bg-card shadow-card"
        >
          <!-- Category header row -->
          <div class="flex items-center gap-3 p-3 sm:p-4">
            <span class="text-2xl" aria-hidden="true">{{ cat.icon }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate font-display text-lg font-bold text-brown">{{ cat.title.AM }}</p>
              <p class="font-serif text-xs text-brown-soft">
                {{ cat.title.EN }} · {{ cat.items.length }} ապրանք
              </p>
            </div>
            <button
              type="button"
              class="rounded-full border border-caramel/40 px-3 py-1.5 text-sm font-semibold text-brown transition hover:border-caramel"
              @click="expanded = expanded === cat.id ? null : cat.id"
            >
              {{ expanded === cat.id ? 'Փակել' : 'Ապրանքներ' }}
            </button>
            <button
              type="button"
              class="rounded-full p-2 text-brown-soft transition hover:bg-cream hover:text-brown"
              title="Խմբագրել"
              @click="openEditCategory(cat)"
            >
              ✎
            </button>
            <button
              type="button"
              class="rounded-full p-2 text-brown-soft transition hover:bg-red-50 hover:text-red-600"
              title="Ջնջել"
              @click="confirmRemoveCategory(cat.id)"
            >
              🗑
            </button>
          </div>

          <!-- Products -->
          <div v-if="expanded === cat.id" class="border-t border-brown/10 bg-cream/40 p-3 sm:p-4">
            <div class="mb-3 flex justify-end">
              <button
                type="button"
                class="rounded-full bg-caramel px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-caramel-dark"
                @click="openAddProduct(cat.id)"
              >
                + Ապրանք
              </button>
            </div>

            <p v-if="!cat.items.length" class="py-4 text-center font-serif text-sm text-brown-soft">
              Ապրանք չկա։
            </p>

            <div class="flex flex-col gap-2">
              <div
                v-for="item in cat.items"
                :key="item.id"
                class="flex items-center gap-3 rounded-2xl border border-brown/5 bg-white p-2"
                :class="{ 'opacity-60': item.available === false }"
              >
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-caramel/25 to-herb/15"
                >
                  <img v-if="item.image" :src="item.image" :alt="item.name.AM" class="h-full w-full object-cover" :class="{ grayscale: item.available === false }" />
                  <span v-else aria-hidden="true">{{ cat.icon }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-serif font-semibold text-brown">{{ item.name.AM }}</p>
                  <p class="truncate font-serif text-xs text-brown-soft">{{ item.description.AM }}</p>
                </div>
                <!-- Availability toggle -->
                <button
                  type="button"
                  class="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold transition"
                  :class="
                    item.available === false
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-herb/15 text-herb hover:bg-herb/25'
                  "
                  :title="item.available === false ? 'Նշել որպես կա' : 'Նշել որպես չկա'"
                  @click="store.toggleAvailable(cat.id, item.id)"
                >
                  {{ item.available === false ? 'Չկա' : 'Կա' }}
                </button>
                <span
                  v-if="item.badge"
                  class="hidden shrink-0 rounded-full bg-caramel/15 px-2 py-0.5 text-xs font-semibold text-caramel-dark sm:inline"
                  >{{ badgeLabels[item.badge].icon }}</span
                >
                <span class="shrink-0 font-display font-bold text-caramel-dark">{{ fmtPrice(item.price) }} ֏</span>
                <button
                  type="button"
                  class="shrink-0 rounded-full p-2 text-brown-soft transition hover:bg-cream hover:text-brown"
                  title="Խմբագրել"
                  @click="openEditProduct(cat.id, item)"
                >
                  ✎
                </button>
                <button
                  type="button"
                  class="shrink-0 rounded-full p-2 text-brown-soft transition hover:bg-red-50 hover:text-red-600"
                  title="Ջնջել"
                  @click="confirmRemoveProduct(cat.id, item.id)"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="modal.open"
        class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 bg-brown/60 backdrop-blur-sm" @click="closeModal" />
        <div
          class="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-card bg-card p-5 shadow-card-hover sm:rounded-card"
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 class="font-display text-xl font-bold text-brown">
              {{ modal.mode === 'add' ? 'Ավելացնել' : 'Խմբագրել' }}
              <span class="text-caramel-dark">
                {{ modal.type === 'level' ? 'բաժին' : modal.type === 'category' ? 'կատեգորիա' : 'ապրանք' }}
              </span>
            </h3>
            <button type="button" class="rounded-full p-2 text-brown-soft hover:bg-cream" @click="closeModal">✕</button>
          </div>

          <form class="flex flex-col gap-4" @submit.prevent="submit">
            <!-- LEVEL / CATEGORY shared: icon + title -->
            <template v-if="modal.type !== 'product'">
              <label class="block">
                <span class="mb-1 block font-serif text-sm font-semibold text-brown">Իկոն (emoji)</span>
                <input v-model="form.icon" type="text" maxlength="4" class="w-24 rounded-xl border border-caramel/30 bg-white px-3 py-2 text-center text-xl outline-none focus:border-caramel" />
              </label>
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <label class="block">
                  <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Անուն (AM)</span>
                  <input v-model="form.title.AM" type="text" required class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 outline-none focus:border-caramel" />
                </label>
                <label class="block">
                  <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Name (EN)</span>
                  <input v-model="form.title.EN" type="text" class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 outline-none focus:border-caramel" />
                </label>
                <label class="block">
                  <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Название (RU)</span>
                  <input v-model="form.title.RU" type="text" class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 outline-none focus:border-caramel" />
                </label>
              </div>
            </template>

            <!-- CATEGORY: level + group -->
            <template v-if="modal.type === 'category'">
              <div class="grid grid-cols-2 gap-2">
                <label class="block">
                  <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Բաժին</span>
                  <select v-model="form.level" class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 outline-none focus:border-caramel">
                    <option v-for="lvl in levels" :key="lvl.id" :value="lvl.id">{{ lvl.title.AM }}</option>
                  </select>
                </label>
                <label v-if="form.level === 'drinks'" class="block">
                  <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Տեսակ</span>
                  <select v-model="form.group" class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 outline-none focus:border-caramel">
                    <option v-for="grp in drinkGroups" :key="grp.id" :value="grp.id">{{ grp.title.AM }}</option>
                  </select>
                </label>
              </div>
            </template>

            <!-- PRODUCT -->
            <template v-if="modal.type === 'product'">
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <label class="block">
                  <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Անուն (AM)</span>
                  <input v-model="form.name.AM" type="text" required class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 outline-none focus:border-caramel" />
                </label>
                <label class="block">
                  <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Name (EN)</span>
                  <input v-model="form.name.EN" type="text" class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 outline-none focus:border-caramel" />
                </label>
                <label class="block">
                  <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Название (RU)</span>
                  <input v-model="form.name.RU" type="text" class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 outline-none focus:border-caramel" />
                </label>
              </div>
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <label class="block">
                  <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Նկարագր. (AM)</span>
                  <input v-model="form.description.AM" type="text" class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 outline-none focus:border-caramel" />
                </label>
                <label class="block">
                  <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Desc. (EN)</span>
                  <input v-model="form.description.EN" type="text" class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 outline-none focus:border-caramel" />
                </label>
                <label class="block">
                  <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Опис. (RU)</span>
                  <input v-model="form.description.RU" type="text" class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 outline-none focus:border-caramel" />
                </label>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <label class="block">
                  <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Գին (֏)</span>
                  <input v-model.number="form.price" type="number" min="0" step="50" class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 outline-none focus:border-caramel" />
                </label>
                <label class="block">
                  <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Պիտակ</span>
                  <select v-model="form.badge" class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 outline-none focus:border-caramel">
                    <option value="">— չկա —</option>
                    <option value="hit">🔥 Հիթ</option>
                    <option value="best">⭐ Ամենավաճառվող</option>
                    <option value="new">🆕 Նոր</option>
                  </select>
                </label>
              </div>
              <label class="flex items-center gap-2.5 rounded-xl border border-caramel/30 bg-white px-3 py-2.5">
                <input v-model="form.available" type="checkbox" class="h-4 w-4 accent-herb" />
                <span class="font-serif text-sm font-semibold text-brown">Հասանելի է (կա պահին)</span>
              </label>
              <!-- Image -->
              <div>
                <span class="mb-1 block font-serif text-xs font-semibold text-brown-soft">Նկար</span>
                <div class="flex items-center gap-3">
                  <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-caramel/25 to-herb/15">
                    <img v-if="form.image" :src="form.image" alt="" class="h-full w-full object-cover" />
                    <span v-else class="text-2xl" aria-hidden="true">🖼</span>
                  </div>
                  <div class="flex-1">
                    <div class="flex gap-2">
                      <input
                        v-model="form.image"
                        type="text"
                        placeholder="Նկարի, էջի կամ Google հղում ..."
                        class="w-full rounded-xl border border-caramel/30 bg-white px-3 py-2 text-sm outline-none focus:border-caramel"
                        @keydown.enter.prevent="resolveImage"
                      />
                      <button
                        type="button"
                        :disabled="resolving"
                        class="shrink-0 rounded-xl bg-brown px-3 py-2 text-sm font-semibold text-white transition hover:bg-brown-light disabled:opacity-60"
                        @click="resolveImage"
                      >
                        {{ resolving ? '...' : 'Բացել' }}
                      </button>
                    </div>
                    <div class="mt-1.5 flex items-center gap-2">
                      <label class="cursor-pointer rounded-full bg-cream px-3 py-1 text-xs font-semibold text-brown transition hover:bg-caramel/20">
                        Վերբեռնել ֆայլ
                        <input type="file" accept="image/*" class="hidden" @change="onFile" />
                      </label>
                      <button v-if="form.image" type="button" class="text-xs font-semibold text-red-500 hover:underline" @click="form.image = ''">Մաքրել</button>
                    </div>
                    <p v-if="resolveError" class="mt-1 text-xs text-red-500">{{ resolveError }}</p>
                    <p class="mt-1 text-xs text-brown-soft">Տեղադրիր էջի կամ Google հղում ու սեղմիր «Բացել» — նկարն ինքն կբացվի։</p>
                  </div>
                </div>
              </div>
            </template>

            <div class="mt-2 flex justify-end gap-2">
              <button type="button" class="rounded-full border border-caramel/40 px-4 py-2 text-sm font-semibold text-brown transition hover:bg-cream" @click="closeModal">
                Չեղարկել
              </button>
              <button type="submit" class="rounded-full bg-caramel px-5 py-2 text-sm font-bold text-white shadow-gold transition hover:bg-caramel-dark">
                Պահպանել
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
