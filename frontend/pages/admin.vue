<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// Universal Admin Panel — ONE panel for every restaurant and every theme.
// All data flows through the service layer (~/services). The public themes
// consume the same normalized data, so nothing here is theme-specific.
// ─────────────────────────────────────────────────────────────────────────
import {
  categoryService,
  productService,
  sectionService,
  uploadService,
  aiService,
  menuService,
  restaurantService,
  type CategoryDraft,
  type ProductDraft,
  type SectionDraft,
} from '~/services'
import type { ThemeId } from '~/models/types'
import { superAdminService, type AdminRestaurantRow } from '~/services/superAdminService'

// The admin manages exactly one restaurant — the signed-in owner's tenant.
// The id/slug are NEVER hardcoded; they come from the loaded restaurant
// (API mode → JWT tenant, mock mode → seed).
const menuStore = useMenuStore()
import type { Category, Product, Section, Badge, LangCode } from '~/models/types'

// ── auth ────────────────────────────────────────────────────────
const auth = useAuthStore()
const needsLogin = ref(false)
const login = reactive({ email: '', password: '' })
const loginError = ref('')
const loggingIn = ref(false)

useHead({ title: 'Admin · QR Menu' })

const rs = useRestaurantStore()
const { restaurant, themes } = storeToRefs(rs)

// ── admin UI language (i18n) ────────────────────────────────────
const { t, lang: adminLang, setLang: setAdminLang, langs: adminLangs } = useAdminI18n()

// ── navigation ─────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', key: 'dashboard', icon: '▦' },
  { id: 'restaurant', key: 'restaurantInfo', icon: '🏠' },
  { id: 'menu', key: 'menuBuilder', icon: '🗂' },
  { id: 'products', key: 'products', icon: '🍽' },
  { id: 'design', key: 'design', icon: '🎨' },
  { id: 'languages', key: 'languages', icon: '🌐' },
  { id: 'qr', key: 'qrCode', icon: '▣' },
] as const
// SUPER_ADMIN is a platform role with no tenant — it gets its own single tab
// (Restaurants) instead of the per-restaurant panel.
const isSuperAdmin = computed(() => auth.user?.role === 'SUPER_ADMIN')
const SUPER_NAV = [{ id: 'restaurants', key: 'restaurants', icon: '🏢' }] as const
const navItems = computed<readonly { id: string; key: string; icon: string }[]>(() =>
  isSuperAdmin.value ? SUPER_NAV : NAV,
)

const active = ref<string>('dashboard')
const sidebarOpen = ref(false)

// ── data (loaded via services) ─────────────────────────────────
const sections = ref<Section[]>([])
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
  ;[sections.value, categories.value, products.value] = await Promise.all([
    sectionService.getSections(),
    categoryService.getCategories(),
    productService.getProducts(),
  ])
  // Keep the active section valid (e.g. after delete or first load).
  if (!sections.value.some((s) => s.id === menuSection.value)) {
    menuSection.value = sections.value[0]?.id ?? ''
  }
}

// ── super-admin (platform) ──────────────────────────────────────
const saRestaurants = ref<AdminRestaurantRow[]>([])
const saForm = reactive({ slug: '', name: '', themeKey: 'aria', defaultLang: 'hy', ownerEmail: '', ownerPassword: '' })
const saCreating = ref(false)
const saError = ref('')
const saResult = ref<{ email: string; password: string; slug: string } | null>(null)

const loadSuperAdmin = async () => {
  try {
    saRestaurants.value = await superAdminService.list()
  } catch (e) {
    console.error('Failed to load restaurants', e)
    flash(t('loadFailed'))
  }
}

// Edit an existing restaurant (name / theme / language / active).
const saEdit = reactive({ open: false, id: '', name: '', themeKey: 'aria', defaultLang: 'hy', isActive: true, planKey: 'free' as 'free' | 'pro' | 'business' })
const saSaving = ref(false)
const saEditError = ref('')

const openEditRestaurant = (r: AdminRestaurantRow) => {
  saEditError.value = ''
  Object.assign(saEdit, {
    open: true,
    id: r.id,
    name: r.name,
    themeKey: r.themeKey || 'aria',
    defaultLang: 'hy',
    isActive: r.isActive,
    planKey: r.planKey || 'free',
  })
}

const saSave = async () => {
  saEditError.value = ''
  if (!saEdit.name.trim()) return void (saEditError.value = t('nameRequired'))
  saSaving.value = true
  try {
    await superAdminService.update(saEdit.id, {
      name: saEdit.name.trim(),
      themeKey: saEdit.themeKey,
      defaultLang: saEdit.defaultLang,
      isActive: saEdit.isActive,
      planKey: saEdit.planKey,
    })
    saEdit.open = false
    await loadSuperAdmin()
    flash(t('saved'))
  } catch (e) {
    saEditError.value = (e as Error)?.message || t('createFailed')
  } finally {
    saSaving.value = false
  }
}

const removeRestaurant = (r: AdminRestaurantRow) =>
  askDelete(t('deleteRestaurant'), t('deleteRestaurantConfirm').replace('{name}', r.name), async () => {
    await superAdminService.remove(r.id)
    flash(t('deleted'))
    await loadSuperAdmin()
  })

const createRestaurant = async () => {
  saError.value = ''
  saResult.value = null
  const slug = saForm.slug.trim().toLowerCase()
  const name = saForm.name.trim()
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) return void (saError.value = t('slugInvalid'))
  if (!name) return void (saError.value = t('nameRequired'))
  saCreating.value = true
  try {
    const res = await superAdminService.create({
      slug,
      name,
      themeKey: saForm.themeKey || undefined,
      defaultLang: saForm.defaultLang || undefined,
      ownerEmail: saForm.ownerEmail.trim() || undefined,
      ownerPassword: saForm.ownerPassword.trim() || undefined,
    })
    saResult.value = { email: res.owner.email, password: res.owner.password, slug: res.restaurant.slug }
    saForm.slug = ''
    saForm.name = ''
    saForm.ownerEmail = ''
    saForm.ownerPassword = ''
    await loadSuperAdmin()
    flash(t('restaurantCreated'))
  } catch (e) {
    saError.value = (e as Error)?.message || t('createFailed')
  } finally {
    saCreating.value = false
  }
}

const loadAll = async () => {
  busy.value = true
  // SUPER_ADMIN has no tenant — skip the per-restaurant loads entirely and
  // load the platform restaurants list instead.
  if (isSuperAdmin.value) {
    active.value = 'restaurants'
    try {
      await loadSuperAdmin()
    } finally {
      pageReady.value = true
      busy.value = false
    }
    return
  }
  // 1) Resolve the tenant identity — REQUIRED to render the shell. If this
  //    fails (bad/expired token), fall back to the login gate, never a loader.
  try {
    await rs.load()
  } catch (e) {
    busy.value = false
    console.error('Failed to load restaurant', e)
    needsLogin.value = true
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
  await auth.init()
  if (!auth.isAuthenticated) {
    needsLogin.value = true
    return
  }
  await loadAll()
})

// ── derived ────────────────────────────────────────────────────
const trLabel = (tr: { hy: string; en: string; ru: string }) => tr.hy || tr.en || tr.ru || '—'
const sectionName = (id: string) => {
  const s = sections.value.find((x) => x.id === id)
  return s ? trLabel(s.name) : '—'
}
const stats = computed(() => ({
  products: products.value.length,
  categories: categories.value.length,
  active: products.value.filter((p) => p.available).length,
}))
const categoryName = (id: string) => {
  const c = categories.value.find((x) => x.id === id)
  return c ? trLabel(c.name) : '—'
}
const publicUrl = computed(() => `https://menus.am/${restaurant.value.slug}`)
const qrImage = computed(
  () =>
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(publicUrl.value)}`,
)

// ── filters ────────────────────────────────────────────────────
const menuSection = ref<string>('') // active section id
const prodSection = ref<string>('all') // section id or 'all'
const prodSearch = ref('')
const visibleCategories = computed(() =>
  categories.value.filter((c) => c.sectionId === menuSection.value),
)
const visibleProducts = computed(() => {
  const q = prodSearch.value.trim().toLowerCase()
  return products.value.filter(
    (p) =>
      (prodSection.value === 'all' || p.sectionId === prodSection.value) &&
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
  sectionId: '',
  name: blankTr(),
  description: blankTr(),
  icon: '🍽',
  iconImage: '',
  image: '',
  mobileImage: '',
  sortOrder: 0,
  active: true,
})
const openAddCategory = () => {
  if (!menuSection.value) {
    flash('Նախ ստեղծիր բաժին')
    return
  }
  Object.assign(catDraft, {
    sectionId: menuSection.value,
    name: blankTr(),
    description: blankTr(),
    icon: '🍽',
    iconImage: '',
    image: '',
    mobileImage: '',
    sortOrder: visibleCategories.value.length,
    active: true,
  })
  Object.assign(catModal, { open: true, mode: 'add', id: '' })
}
const openEditCategory = (c: Category) => {
  Object.assign(catDraft, {
    sectionId: c.sectionId,
    name: { ...c.name },
    description: { ...c.description },
    icon: c.icon,
    iconImage: c.iconImage,
    image: c.image,
    mobileImage: c.mobileImage,
    sortOrder: c.sortOrder,
    active: c.active,
  })
  Object.assign(catModal, { open: true, mode: 'edit', id: c.id })
}
const hasName = (tr: { hy: string; en: string; ru: string }) =>
  !!(tr.hy.trim() || tr.en.trim() || tr.ru.trim())

const submitCategory = async () => {
  if (!hasName(catDraft.name)) {
    flash('Անվանումը պարտադիր է (գոնե մեկ լեզվով)')
    return
  }
  busy.value = true
  try {
    if (catModal.mode === 'add') await categoryService.createCategory({ ...catDraft })
    else await categoryService.updateCategory(catModal.id, { ...catDraft })
    // Show the section the category belongs to, so it's always visible in the list.
    menuSection.value = catDraft.sectionId
    catModal.open = false
    flash(t('saved'))
    await refresh().catch(() => {}) // a refresh hiccup must not hide a successful save
  } catch (e) {
    flash((e as Error)?.message || 'Չհաջողվեց պահպանել կատեգորիան')
  } finally {
    busy.value = false
  }
}
// ── delete confirmation (custom modal, not window.confirm) ──────
const confirmState = reactive({
  open: false,
  title: '',
  message: '',
  busy: false,
  onConfirm: null as null | (() => Promise<void>),
})
const askDelete = (title: string, message: string, onConfirm: () => Promise<void>) => {
  Object.assign(confirmState, { open: true, title, message, busy: false, onConfirm })
}
const runConfirm = async () => {
  if (!confirmState.onConfirm) return
  confirmState.busy = true
  try {
    await confirmState.onConfirm()
    confirmState.open = false
  } catch (e) {
    flash((e as Error)?.message || 'Չհաջողվեց ջնջել')
  } finally {
    confirmState.busy = false
  }
}

const removeCategory = (c: Category) =>
  askDelete('Ջնջե՞լ կատեգորիան', `«${c.name.hy || c.name.en || c.name.ru}» կատեգորիան և դրա բոլոր ապրանքները կջնջվեն։`, async () => {
    await categoryService.deleteCategory(c.id)
    flash(t('deleted'))
    await refresh().catch(() => {})
  })

// ── sections (dynamic top-level tabs) ───────────────────────────
const secModal = reactive({ open: false, mode: 'add' as 'add' | 'edit', id: '' })
const secDraft = reactive<SectionDraft>({ name: blankTr(), icon: '🍽', image: '', sortOrder: 0, active: true })
const openAddSection = () => {
  Object.assign(secDraft, { name: blankTr(), icon: '🍽', image: '', sortOrder: sections.value.length, active: true })
  Object.assign(secModal, { open: true, mode: 'add', id: '' })
}
const openEditSection = (s: Section) => {
  Object.assign(secDraft, { name: { ...s.name }, icon: s.icon, image: s.image, sortOrder: s.sortOrder, active: s.active })
  Object.assign(secModal, { open: true, mode: 'edit', id: s.id })
}
const submitSection = async () => {
  if (!hasName(secDraft.name)) {
    flash('Անվանումը պարտադիր է (գոնե մեկ լեզվով)')
    return
  }
  busy.value = true
  try {
    if (secModal.mode === 'add') {
      const created = await sectionService.createSection({ ...secDraft })
      menuSection.value = created.id
    } else {
      await sectionService.updateSection(secModal.id, { ...secDraft })
    }
    secModal.open = false
    flash(t('saved'))
    await refresh().catch(() => {})
  } catch (e) {
    flash((e as Error)?.message || 'Չհաջողվեց պահպանել բաժինը')
  } finally {
    busy.value = false
  }
}
const removeSection = (s: Section) =>
  askDelete('Ջնջե՞լ բաժինը', `«${trLabel(s.name)}» բաժինը և դրա բոլոր կատեգորիաներն ու ապրանքները կջնջվեն։`, async () => {
    await sectionService.deleteSection(s.id)
    flash(t('deleted'))
    await refresh().catch(() => {})
  })

const prodModal = reactive({ open: false, mode: 'add' as 'add' | 'edit', id: '' })
const prodDraft = reactive<ProductDraft>({
  categoryId: '',
  sectionId: '',
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
    sectionId: firstCat?.sectionId ?? '',
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
    sectionId: p.sectionId,
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
    if (c) prodDraft.sectionId = c.sectionId
  },
)
const toggleBadge = (b: Badge) => {
  const i = prodDraft.badges.indexOf(b)
  if (i >= 0) prodDraft.badges.splice(i, 1)
  else prodDraft.badges.push(b)
}
const submitProduct = async () => {
  if (!prodDraft.categoryId) {
    flash('Ընտրիր կատեգորիա')
    return
  }
  if (!hasName(prodDraft.name)) {
    flash('Անվանումը պարտադիր է (գոնե մեկ լեզվով)')
    return
  }
  if (!(prodDraft.price > 0)) {
    flash('Գինը պետք է լինի 0-ից մեծ')
    return
  }
  busy.value = true
  try {
    if (prodModal.mode === 'add') await productService.createProduct({ ...prodDraft })
    else await productService.updateProduct(prodModal.id, { ...prodDraft })
    prodModal.open = false
    flash(t('saved'))
    await refresh().catch(() => {})
  } catch (e) {
    flash((e as Error)?.message || 'Չհաջողվեց պահպանել ապրանքը')
  } finally {
    busy.value = false
  }
}
// ── AI (Professional/Business — enforced by backend) ────────────
const aiBusy = ref(false)
// Show AI controls only on paid plans (backend also enforces this).
const aiEnabled = computed(() => ['pro', 'business'].includes(restaurant.value?.planKey ?? 'free'))
const firstFilled = (tr: { hy: string; ru: string; en: string }): 'hy' | 'ru' | 'en' | null => {
  for (const l of ['hy', 'ru', 'en'] as const) if (tr[l]?.trim()) return l
  return null
}
const aiTranslateField = async (field: 'name' | 'description') => {
  const tr = prodDraft[field]
  const src = firstFilled(tr)
  if (!src) {
    flash(t('aiNeedText'))
    return
  }
  const targets = (['hy', 'ru', 'en'] as const).filter((l) => l !== src)
  aiBusy.value = true
  try {
    const out = await aiService.translate(tr[src], src, [...targets])
    for (const l of targets) if (out[l]) tr[l] = out[l]
    flash(t('aiDone'))
  } catch (e) {
    flash((e as Error)?.message || t('aiFailed'))
  } finally {
    aiBusy.value = false
  }
}
const aiTranslateName = () => aiTranslateField('name')
const aiTranslateDesc = () => aiTranslateField('description')
const aiDescribe = async () => {
  const src = firstFilled(prodDraft.name)
  if (!src) {
    flash(t('aiNeedName'))
    return
  }
  aiBusy.value = true
  try {
    const out = await aiService.describe(prodDraft.name[src], ['hy', 'ru', 'en'])
    for (const l of ['hy', 'ru', 'en'] as const) if (out[l]) prodDraft.description[l] = out[l]
    flash(t('aiDone'))
  } catch (e) {
    flash((e as Error)?.message || t('aiFailed'))
  } finally {
    aiBusy.value = false
  }
}

// ── ordering (drag-free: up/down; persists sortOrder) ───────────
const reordering = ref(false)
async function persistOrder<T extends { id: string }>(
  ordered: T[],
  persist: (items: { id: string; sortOrder: number }[]) => Promise<void>,
) {
  reordering.value = true
  try {
    await persist(ordered.map((x, i) => ({ id: x.id, sortOrder: i })))
    await refresh().catch(() => {})
  } catch (e) {
    flash((e as Error)?.message || 'Չհաջողվեց փոխել հերթականությունը')
  } finally {
    reordering.value = false
  }
}
const swapMove = <T,>(list: T[], index: number, dir: -1 | 1): T[] | null => {
  const j = index + dir
  if (j < 0 || j >= list.length) return null
  const arr = [...list]
  ;[arr[index], arr[j]] = [arr[j], arr[index]]
  return arr
}
const moveCategory = (index: number, dir: -1 | 1) => {
  if (reordering.value) return
  const arr = swapMove(visibleCategories.value, index, dir)
  if (arr) persistOrder(arr, categoryService.reorder)
}
const moveProduct = (index: number, dir: -1 | 1) => {
  if (reordering.value) return
  const arr = swapMove(visibleProducts.value, index, dir)
  if (arr) persistOrder(arr, productService.reorder)
}

const removeProduct = (p: Product) =>
  askDelete('Ջնջե՞լ ապրանքը', `«${p.name.hy || p.name.en || p.name.ru}» ապրանքը կջնջվի։`, async () => {
    await productService.deleteProduct(p.id)
    flash(t('deleted'))
    await refresh().catch(() => {})
  })
const toggleAvailable = async (p: Product) => {
  try {
    await productService.setAvailability(p.id, !p.available)
    await refresh().catch(() => {})
  } catch (e) {
    flash((e as Error)?.message || 'Չհաջողվեց փոխել')
  }
}

// ── image handling (shared by both drafts) ─────────────────────
const onUpload = async (e: Event, target: { image: string }) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const { url } = await uploadService.uploadImage(file)
  target.image = url
}
// Generic: upload a file and store its hosted URL into obj[key] (sections,
// category icon/banner, etc.). Used where the field isn't literally `image`.
const onUploadInto = async (e: Event, obj: Record<string, unknown>, key: string) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const { url } = await uploadService.uploadImage(file)
    obj[key] = url
  } catch (err) {
    flash((err as Error)?.message || 'Չհաջողվեց վերբեռնել')
  } finally {
    input.value = ''
  }
}

// Restaurant logo upload (same pipeline: file → hosted/data URL → restaurant.logo).
const uploadingLogo = ref(false)
const onLogoUpload = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploadingLogo.value = true
  try {
    const { url } = await uploadService.uploadImage(file)
    restaurant.value.logo = url
  } catch {
    flash('Չհաջողվեց վերբեռնել լոգոն')
  } finally {
    uploadingLogo.value = false
    input.value = '' // allow re-selecting the same file
  }
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
  busy.value = true
  try {
    await restaurantService.setTheme(restaurant.value.id, id as ThemeId)
    restaurant.value.themeId = id as ThemeId // reflect immediately in the admin
    flash('Թեման պահպանվեց')
  } catch (e) {
    flash((e as Error)?.message || 'Չհաջողվեց փոխել թեման')
  } finally {
    busy.value = false
  }
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
// Wrap a save action with busy state + error surfacing.
const withBusy = async (fn: () => Promise<unknown>, ok = 'Պահպանված է') => {
  busy.value = true
  try {
    await fn()
    flash(ok)
  } catch (e) {
    flash((e as Error)?.message || 'Չհաջողվեց պահպանել')
  } finally {
    busy.value = false
  }
}
const saveRestaurant = () => withBusy(() => rs.saveRestaurant({ ...restaurant.value }))
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
          <p class="text-sm font-bold text-slate-900">{{ isSuperAdmin ? 'Menus.am' : restaurant.name }}</p>
          <p class="text-xs text-slate-500">{{ isSuperAdmin ? 'SUPER ADMIN' : t('adminSubtitle') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="busy" class="text-xs text-slate-400">…</span>
        <!-- Admin UI language switcher -->
        <div class="flex overflow-hidden rounded-lg ring-1 ring-slate-200">
          <button
            v-for="l in adminLangs"
            :key="l.code"
            class="px-2.5 py-1.5 text-[11px] font-bold transition"
            :class="adminLang === l.code ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'"
            @click="setAdminLang(l.code)"
          >{{ l.label }}</button>
        </div>
        <NuxtLink v-if="!isSuperAdmin" :to="`/${restaurant.slug}`" target="_blank" class="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
          {{ t('viewMenu') }} ↗
        </NuxtLink>
        <button
          v-if="auth.isAuthenticated"
          class="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          @click="doLogout"
        >
          {{ t('logout') }}
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
            v-for="n in navItems"
            :key="n.id"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition"
            :class="active === n.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'"
            @click="active = n.id; sidebarOpen = false"
          >
            <span class="w-5 text-center" aria-hidden="true">{{ n.icon }}</span>
            {{ t(n.key) }}
          </button>
        </nav>
      </aside>
      <div v-if="sidebarOpen" class="fixed inset-0 z-30 bg-black/30 lg:hidden" @click="sidebarOpen = false" />

      <!-- Main -->
      <main class="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <!-- SUPER_ADMIN · RESTAURANTS -->
        <section v-if="active === 'restaurants'" class="space-y-6">
          <div>
            <h1 class="text-xl font-bold text-slate-900">{{ t('restaurants') }}</h1>
            <p class="mt-1 text-sm text-slate-500">{{ t('restaurantsHint') }}</p>
          </div>

          <!-- Create form -->
          <div class="max-w-2xl rounded-xl border border-slate-200 bg-white p-5">
            <h2 class="text-sm font-semibold text-slate-900">{{ t('addRestaurant') }}</h2>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="text-xs font-medium text-slate-600">{{ t('name') }}</span>
                <input v-model="saForm.name" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" :placeholder="t('namePlaceholder')" />
              </label>
              <label class="block">
                <span class="text-xs font-medium text-slate-600">{{ t('slug') }}</span>
                <input v-model="saForm.slug" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="my-cafe" />
              </label>
              <label class="block">
                <span class="text-xs font-medium text-slate-600">{{ t('theme') }}</span>
                <select v-model="saForm.themeKey" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option v-for="th in themes" :key="th.id" :value="th.id">{{ th.name }}</option>
                </select>
              </label>
              <label class="block">
                <span class="text-xs font-medium text-slate-600">{{ t('defaultLang') }}</span>
                <select v-model="saForm.defaultLang" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="hy">Հայերեն</option>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </label>
              <label class="block">
                <span class="text-xs font-medium text-slate-600">{{ t('ownerEmail') }} <span class="text-slate-400">({{ t('optional') }})</span></span>
                <input v-model="saForm.ownerEmail" type="email" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="owner@my-cafe.test" />
              </label>
              <label class="block">
                <span class="text-xs font-medium text-slate-600">{{ t('ownerPassword') }} <span class="text-slate-400">({{ t('optional') }})</span></span>
                <input v-model="saForm.ownerPassword" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="password123" />
              </label>
            </div>
            <p v-if="saError" class="mt-3 text-sm text-rose-600">{{ saError }}</p>
            <button
              class="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              :disabled="saCreating"
              @click="createRestaurant"
            >
              <span v-if="saCreating" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {{ saCreating ? t('creating') : t('addRestaurant') }}
            </button>

            <div v-if="saResult" class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <p class="font-semibold text-emerald-800">{{ t('restaurantCreated') }}</p>
              <p class="mt-1 text-emerald-700">{{ t('publicUrl') }}: <code>/{{ saResult.slug }}</code></p>
              <p class="text-emerald-700">{{ t('ownerLogin') }}: <code>{{ saResult.email }}</code> / <code>{{ saResult.password }}</code></p>
            </div>
          </div>

          <!-- List -->
          <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th class="px-4 py-3">{{ t('name') }}</th>
                  <th class="px-4 py-3">{{ t('slug') }}</th>
                  <th class="px-4 py-3">{{ t('theme') }}</th>
                  <th class="px-4 py-3">{{ t('plan') }}</th>
                  <th class="px-4 py-3 text-center">{{ t('sectionsCount') }}</th>
                  <th class="px-4 py-3 text-center">{{ t('categoriesCount') }}</th>
                  <th class="px-4 py-3 text-center">{{ t('productsCount') }}</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="r in saRestaurants" :key="r.id">
                  <td class="px-4 py-3 font-medium text-slate-900">{{ r.name }}</td>
                  <td class="px-4 py-3 text-slate-500"><code>{{ r.slug }}</code></td>
                  <td class="px-4 py-3 capitalize text-slate-600">{{ r.themeKey || '—' }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                      :class="r.planKey === 'business' ? 'bg-amber-100 text-amber-700' : r.planKey === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'"
                    >{{ r.planKey === 'pro' ? 'Professional' : r.planKey === 'business' ? 'Business' : 'Starter' }}</span>
                  </td>
                  <td class="px-4 py-3 text-center text-slate-600">{{ r.sections }}</td>
                  <td class="px-4 py-3 text-center text-slate-600">{{ r.categories }}</td>
                  <td class="px-4 py-3 text-center text-slate-600">{{ r.products }}</td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-3">
                      <a :href="`/${r.slug}`" target="_blank" class="text-sm font-medium text-slate-500 hover:text-slate-900 hover:underline">{{ t('view') }} ↗</a>
                      <button class="text-sm font-medium text-slate-600 hover:text-slate-900" @click="openEditRestaurant(r)">{{ t('edit') }}</button>
                      <button class="text-sm font-medium text-rose-600 hover:text-rose-700" @click="removeRestaurant(r)">{{ t('delete') }}</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!saRestaurants.length">
                  <td colspan="7" class="px-4 py-8 text-center text-slate-400">{{ t('noRestaurants') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- DASHBOARD -->
        <section v-if="active === 'dashboard'" class="space-y-6">
          <h1 class="text-xl font-bold text-slate-900">{{ t('dashboard') }}</h1>
          <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs text-slate-500">{{ t('totalProducts') }}</p>
              <p class="mt-1 text-2xl font-bold text-slate-900">{{ stats.products }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs text-slate-500">{{ t('categoriesCount') }}</p>
              <p class="mt-1 text-2xl font-bold text-slate-900">{{ stats.categories }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs text-slate-500">{{ t('available') }}</p>
              <p class="mt-1 text-2xl font-bold text-emerald-600">{{ stats.active }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs text-slate-500">{{ t('activeTheme') }}</p>
              <p class="mt-1 text-2xl font-bold capitalize text-slate-900">{{ restaurant.themeId }}</p>
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <p class="text-xs text-slate-500">{{ t('qrMenuLink') }}</p>
            <div class="mt-1 flex items-center gap-3">
              <code class="truncate text-sm text-slate-800">{{ publicUrl }}</code>
              <button class="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold hover:bg-slate-200" @click="copyLink">{{ t('copy') }}</button>
            </div>
          </div>
          <div>
            <p class="mb-2 text-sm font-semibold text-slate-700">{{ t('quickActions') }}</p>
            <div class="flex flex-wrap gap-2">
              <button class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700" @click="active = 'products'; openAddProduct()">{{ t('addProduct') }}</button>
              <button class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50" @click="active = 'menu'; openAddCategory()">{{ t('addCategory') }}</button>
              <button class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50" @click="active = 'design'">{{ t('changeTheme') }}</button>
            </div>
          </div>
        </section>

        <!-- RESTAURANT INFO -->
        <section v-else-if="active === 'restaurant'" class="max-w-2xl space-y-5">
          <h1 class="text-xl font-bold text-slate-900">{{ t('restaurantInfo') }}</h1>
          <div class="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <!-- Logo -->
            <div>
              <span class="lbl">Լոգո</span>
              <div class="mt-1.5 flex items-center gap-4">
                <div class="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img v-if="restaurant.logo" :src="restaurant.logo" alt="logo" class="h-full w-full object-cover" />
                  <span v-else class="text-xl font-bold text-slate-300">{{ (restaurant.name || '?').charAt(0) }}</span>
                </div>
                <div class="flex flex-col items-start gap-1.5">
                  <label class="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50" :class="uploadingLogo && 'pointer-events-none opacity-60'">
                    {{ uploadingLogo ? t('saving') : (restaurant.logo ? 'Փոխել լոգոն' : 'Վերբեռնել լոգո') }}
                    <input type="file" accept="image/*" class="hidden" @change="onLogoUpload" />
                  </label>
                  <button v-if="restaurant.logo" type="button" class="text-xs font-medium text-rose-600 hover:text-rose-700" @click="restaurant.logo = ''">Հեռացնել</button>
                  <p class="text-[11px] text-slate-400">PNG կամ JPG, քառակուսի՝ լավագույն արդյունքի համար</p>
                </div>
              </div>
            </div>
            <label class="block"><span class="lbl">Name</span><input v-model="restaurant.name" class="inp" /></label>
            <label class="block"><span class="lbl">Tagline (HY)</span><input v-model="restaurant.tagline.hy" class="inp" /></label>
            <div class="grid grid-cols-2 gap-4">
              <label class="block"><span class="lbl">Tagline (EN)</span><input v-model="restaurant.tagline.en" class="inp" /></label>
              <label class="block"><span class="lbl">Tagline (RU)</span><input v-model="restaurant.tagline.ru" class="inp" /></label>
            </div>
            <label class="block"><span class="lbl">Working hours</span><input v-model="restaurant.workingHours" class="inp" /></label>
            <label class="block"><span class="lbl">Address</span><input v-model="restaurant.address" class="inp" /></label>
            <label class="block"><span class="lbl">Rating</span><input v-model.number="restaurant.rating" type="number" step="0.1" class="inp" /></label>
            <button class="btn-primary" :disabled="busy" @click="saveRestaurant">{{ busy ? t('saving') : t('save') }}</button>
          </div>
        </section>

        <!-- MENU BUILDER -->
        <section v-else-if="active === 'menu'" class="space-y-5">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-slate-900">{{ t('menuBuilder') }}</h1>
            <div class="flex gap-2">
              <button class="btn-ghost" @click="openAddSection">{{ t('addSection') }}</button>
              <button class="btn-primary" :disabled="!sections.length" @click="openAddCategory">{{ t('addCategory') }}</button>
            </div>
          </div>

          <!-- Dynamic section tabs (add / edit / delete) -->
          <div class="flex flex-wrap items-center gap-2">
            <div
              v-for="s in sections"
              :key="s.id"
              class="flex items-center overflow-hidden rounded-full text-sm font-semibold transition"
              :class="menuSection === s.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'"
            >
              <button class="py-1.5 pl-4 pr-2" @click="menuSection = s.id">{{ s.icon }} {{ trLabel(s.name) }}</button>
              <template v-if="menuSection === s.id">
                <button class="px-1 opacity-80 hover:opacity-100" :title="t('edit')" @click="openEditSection(s)">✎</button>
                <button class="pl-1 pr-3 opacity-80 hover:opacity-100" :title="t('delete')" @click="removeSection(s)">🗑</button>
              </template>
            </div>
            <p v-if="!sections.length" class="text-sm text-slate-400">{{ t('noSections') }}</p>
          </div>

          <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <p v-if="!visibleCategories.length" class="p-8 text-center text-sm text-slate-400">{{ t('noCategories') }}</p>
            <ul v-else class="divide-y divide-slate-100">
              <li v-for="(c, ci) in visibleCategories" :key="c.id" class="flex items-center gap-3 p-3">
                <div class="flex flex-col">
                  <button class="ord-btn" :disabled="ci === 0 || reordering" title="Վերև" @click="moveCategory(ci, -1)">▲</button>
                  <button class="ord-btn" :disabled="ci === visibleCategories.length - 1 || reordering" title="Ներքև" @click="moveCategory(ci, 1)">▼</button>
                </div>
                <span class="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-xl">
                  <img v-if="c.iconImage" :src="c.iconImage" alt="" class="h-full w-full object-cover" />
                  <template v-else>{{ c.icon }}</template>
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-slate-900">{{ trLabel(c.name) }}</p>
                  <p class="truncate text-xs text-slate-500">{{ products.filter((p) => p.categoryId === c.id).length }} {{ t('itemsWord') }}</p>
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
            <h1 class="text-xl font-bold text-slate-900">{{ t('products') }}</h1>
            <button class="btn-primary" @click="openAddProduct">{{ t('addProduct') }}</button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <select v-model="prodSection" class="inp w-auto">
              <option value="all">{{ t('all') }}</option>
              <option v-for="s in sections" :key="s.id" :value="s.id">{{ trLabel(s.name) }}</option>
            </select>
            <input v-model="prodSearch" :placeholder="t('search')" class="inp w-auto flex-1" />
          </div>
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full text-sm">
              <thead class="border-b border-slate-100 text-left text-xs text-slate-500">
                <tr>
                  <th class="w-8 p-3"></th>
                  <th class="p-3">{{ t('colProduct') }}</th>
                  <th class="p-3">{{ t('colCategory') }}</th>
                  <th class="p-3">{{ t('colPrice') }}</th>
                  <th class="p-3">{{ t('colStatus') }}</th>
                  <th class="p-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(p, pi) in visibleProducts" :key="p.id">
                  <td class="p-3 align-middle">
                    <div v-if="!prodSearch" class="flex flex-col">
                      <button class="ord-btn" :disabled="pi === 0 || reordering" title="Վերև" @click="moveProduct(pi, -1)">▲</button>
                      <button class="ord-btn" :disabled="pi === visibleProducts.length - 1 || reordering" title="Ներքև" @click="moveProduct(pi, 1)">▼</button>
                    </div>
                  </td>
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
                    >{{ p.available ? t('inStock') : t('outOfStock') }}</button>
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
            <p v-if="!visibleProducts.length" class="p-8 text-center text-sm text-slate-400">{{ t('noProducts') }}</p>
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
            <button class="btn-primary" :disabled="busy" @click="saveRestaurant">{{ busy ? t('saving') : t('save') }}</button>
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

      </main>
    </div>

    <!-- Toast -->
    <Transition name="t">
      <div v-if="toast" class="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg">{{ toast }}</div>
    </Transition>

    <!-- Category modal -->
    <AdminModal v-if="catModal.open" :title="catModal.mode === 'add' ? t('newCategory') : t('editCategory')" @close="catModal.open = false">
      <div class="space-y-4">
        <div class="flex items-end gap-3">
          <div class="w-24">
            <span class="lbl">{{ t('icon') }} <span class="font-normal text-slate-400">400×400</span></span>
            <label class="mt-1 grid h-[42px] cursor-pointer place-items-center overflow-hidden rounded-lg border border-slate-300 bg-white transition hover:border-slate-900">
              <img v-if="catDraft.iconImage" :src="catDraft.iconImage" class="h-full w-full object-cover" alt="" />
              <span v-else class="text-xl">{{ catDraft.icon || '🍽' }}</span>
              <input type="file" accept="image/*" class="hidden" @change="onUploadInto($event, catDraft, 'iconImage')" />
            </label>
            <button v-if="catDraft.iconImage" type="button" class="mt-0.5 text-[10px] text-rose-500 hover:underline" @click="catDraft.iconImage = ''">{{ t('remove') }}</button>
          </div>
          <div class="flex-1">
            <span class="lbl">{{ t('sectionField') }}</span>
            <div class="inp flex items-center bg-slate-100 text-slate-500">{{ sectionName(catDraft.sectionId) }}</div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div>
            <span class="lbl">{{ t('bannerDesktop') }} <span class="font-normal text-slate-400">· 1600×500</span></span>
            <div class="mt-1 flex items-center gap-2">
              <div class="grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                <img v-if="catDraft.image" :src="catDraft.image" class="h-full w-full object-cover" alt="" />
                <span v-else class="text-[10px] text-slate-300">16:5</span>
              </div>
              <label class="cursor-pointer text-sm font-medium text-indigo-600 hover:underline">{{ t('upload') }}<input type="file" accept="image/*" class="hidden" @change="onUploadInto($event, catDraft, 'image')" /></label>
              <button v-if="catDraft.image" type="button" class="text-xs text-rose-500 hover:underline" @click="catDraft.image = ''">{{ t('remove') }}</button>
            </div>
          </div>
          <div>
            <span class="lbl">{{ t('bannerMobile') }} <span class="font-normal text-slate-400">· 800×600</span></span>
            <div class="mt-1 flex items-center gap-2">
              <div class="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                <img v-if="catDraft.mobileImage" :src="catDraft.mobileImage" class="h-full w-full object-cover" alt="" />
                <span v-else class="text-[10px] text-slate-300">4:3</span>
              </div>
              <label class="cursor-pointer text-sm font-medium text-indigo-600 hover:underline">{{ t('upload') }}<input type="file" accept="image/*" class="hidden" @change="onUploadInto($event, catDraft, 'mobileImage')" /></label>
              <button v-if="catDraft.mobileImage" type="button" class="text-xs text-rose-500 hover:underline" @click="catDraft.mobileImage = ''">{{ t('remove') }}</button>
            </div>
          </div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <p class="lbl mb-2">{{ t('nameTranslations') }}</p>
          <div class="space-y-2">
            <div class="flex items-center gap-2"><span class="tl-tag">🇦🇲 Հայ</span><input v-model="catDraft.name.hy" class="inp" placeholder="Անվանումը հայերեն" /></div>
            <div class="flex items-center gap-2"><span class="tl-tag">🇷🇺 Рус</span><input v-model="catDraft.name.ru" class="inp" placeholder="Название по-русски" /></div>
            <div class="flex items-center gap-2"><span class="tl-tag">🇬🇧 Eng</span><input v-model="catDraft.name.en" class="inp" placeholder="Name in English" /></div>
          </div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <p class="lbl mb-2">{{ t('descTranslations') }} <span class="font-normal text-slate-400">({{ t('optional') }})</span></p>
          <div class="space-y-2">
            <div class="flex items-center gap-2"><span class="tl-tag">🇦🇲 Հայ</span><input v-model="catDraft.description.hy" class="inp" placeholder="Կարճ նկարագրություն հայերեն" /></div>
            <div class="flex items-center gap-2"><span class="tl-tag">🇷🇺 Рус</span><input v-model="catDraft.description.ru" class="inp" placeholder="Краткое описание по-русски" /></div>
            <div class="flex items-center gap-2"><span class="tl-tag">🇬🇧 Eng</span><input v-model="catDraft.description.en" class="inp" placeholder="Short description in English" /></div>
          </div>
        </div>
        <label class="flex items-center justify-between text-sm"><span>{{ t('active') }}</span><input v-model="catDraft.active" type="checkbox" class="h-4 w-4" /></label>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="catModal.open = false">{{ t('cancel') }}</button>
        <button class="btn-primary" :disabled="busy" @click="submitCategory">{{ busy ? t('saving') : t('save') }}</button>
      </template>
    </AdminModal>

    <!-- Section modal -->
    <AdminModal v-if="secModal.open" :title="secModal.mode === 'add' ? t('newSection') : t('editSection')" @close="secModal.open = false">
      <div class="space-y-4">
        <div>
          <span class="lbl">{{ t('icon') }} <span class="font-normal text-slate-400">200×200</span></span>
          <div class="mt-1 flex items-center gap-3">
            <label class="grid h-14 w-14 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border border-slate-300 bg-white transition hover:border-slate-900">
              <img v-if="secDraft.image" :src="secDraft.image" class="h-full w-full object-cover" alt="" />
              <span v-else class="text-2xl">{{ secDraft.icon || '🍽' }}</span>
              <input type="file" accept="image/*" class="hidden" @change="onUploadInto($event, secDraft, 'image')" />
            </label>
            <label class="cursor-pointer text-sm font-medium text-indigo-600 hover:underline">
              {{ t('upload') }}
              <input type="file" accept="image/*" class="hidden" @change="onUploadInto($event, secDraft, 'image')" />
            </label>
            <button v-if="secDraft.image" type="button" class="text-xs text-rose-500 hover:underline" @click="secDraft.image = ''">{{ t('remove') }}</button>
          </div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <p class="lbl mb-2">{{ t('nameTranslations') }}</p>
          <div class="space-y-2">
            <div class="flex items-center gap-2"><span class="tl-tag">🇦🇲 Հայ</span><input v-model="secDraft.name.hy" class="inp" placeholder="Բաժնի անվանումը հայերեն" /></div>
            <div class="flex items-center gap-2"><span class="tl-tag">🇷🇺 Рус</span><input v-model="secDraft.name.ru" class="inp" placeholder="Название раздела по-русски" /></div>
            <div class="flex items-center gap-2"><span class="tl-tag">🇬🇧 Eng</span><input v-model="secDraft.name.en" class="inp" placeholder="Section name in English" /></div>
          </div>
        </div>
        <label class="flex items-center justify-between text-sm"><span>{{ t('active') }}</span><input v-model="secDraft.active" type="checkbox" class="h-4 w-4" /></label>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="secModal.open = false">{{ t('cancel') }}</button>
        <button class="btn-primary" :disabled="busy" @click="submitSection">{{ busy ? t('saving') : t('save') }}</button>
      </template>
    </AdminModal>

    <!-- Product modal -->
    <AdminModal v-if="prodModal.open" :title="prodModal.mode === 'add' ? t('newProduct') : t('editProduct')" @close="prodModal.open = false">
      <div class="space-y-4">
        <label class="block"><span class="lbl">{{ t('category') }}</span>
          <select v-model="prodDraft.categoryId" class="inp">
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.icon }} {{ trLabel(c.name) }} · {{ sectionName(c.sectionId) }}</option>
          </select>
        </label>
        <div class="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p class="lbl">{{ t('nameTranslations') }}</p>
            <button v-if="aiEnabled" type="button" class="ai-btn" :disabled="aiBusy" @click="aiTranslateName">🌍 {{ aiBusy ? t('aiWorking') : t('aiTranslate') }}</button>
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2"><span class="tl-tag">🇦🇲 Հայ</span><input v-model="prodDraft.name.hy" class="inp" placeholder="Ուտեստի անվանումը հայերեն" /></div>
            <div class="flex items-center gap-2"><span class="tl-tag">🇷🇺 Рус</span><input v-model="prodDraft.name.ru" class="inp" placeholder="Название блюда по-русски" /></div>
            <div class="flex items-center gap-2"><span class="tl-tag">🇬🇧 Eng</span><input v-model="prodDraft.name.en" class="inp" placeholder="Dish name in English" /></div>
          </div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p class="lbl">{{ t('descTranslations') }} <span class="font-normal text-slate-400">({{ t('optional') }})</span></p>
            <div v-if="aiEnabled" class="flex gap-1.5">
              <button type="button" class="ai-btn" :disabled="aiBusy" @click="aiDescribe">✨ {{ t('aiDescribe') }}</button>
              <button type="button" class="ai-btn" :disabled="aiBusy" @click="aiTranslateDesc">🌍 {{ t('aiTranslate') }}</button>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2"><span class="tl-tag">🇦🇲 Հայ</span><input v-model="prodDraft.description.hy" class="inp" placeholder="Բաղադրություն / նկարագրություն հայերեն" /></div>
            <div class="flex items-center gap-2"><span class="tl-tag">🇷🇺 Рус</span><input v-model="prodDraft.description.ru" class="inp" placeholder="Состав / описание по-русски" /></div>
            <div class="flex items-center gap-2"><span class="tl-tag">🇬🇧 Eng</span><input v-model="prodDraft.description.en" class="inp" placeholder="Ingredients / description in English" /></div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <label class="block"><span class="lbl">{{ t('price') }} (֏)</span><input v-model.number="prodDraft.price" type="number" class="inp" /></label>
          <label class="flex items-center justify-between gap-2 self-end pb-2 text-sm"><span>{{ t('available') }}</span><input v-model="prodDraft.available" type="checkbox" class="h-4 w-4" /></label>
        </div>
        <div>
          <span class="lbl">{{ t('badges') }}</span>
          <div class="mt-1.5 flex flex-wrap gap-2">
            <button v-for="b in BADGES" :key="b.id" type="button" class="rounded-full px-3 py-1 text-xs font-semibold transition" :class="prodDraft.badges.includes(b.id) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'" @click="toggleBadge(b.id)">{{ b.label }}</button>
          </div>
        </div>
        <div>
          <span class="lbl">{{ t('image') }}</span>
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
        <button class="btn-ghost" @click="prodModal.open = false">{{ t('cancel') }}</button>
        <button class="btn-primary" :disabled="busy" @click="submitProduct">{{ busy ? t('saving') : t('save') }}</button>
      </template>
    </AdminModal>

    <!-- Super-admin: edit restaurant modal -->
    <AdminModal v-if="saEdit.open" :title="t('editRestaurant')" @close="saEdit.open = false">
      <div class="space-y-4">
        <label class="block">
          <span class="text-xs font-medium text-slate-600">{{ t('name') }}</span>
          <input v-model="saEdit.name" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-600">{{ t('theme') }}</span>
          <select v-model="saEdit.themeKey" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option v-for="th in themes" :key="th.id" :value="th.id">{{ th.name }}</option>
          </select>
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-600">{{ t('defaultLang') }}</span>
          <select v-model="saEdit.defaultLang" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="hy">Հայերեն</option>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-600">{{ t('plan') }}</span>
          <select v-model="saEdit.planKey" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="free">Starter</option>
            <option value="pro">Professional</option>
            <option value="business">Business</option>
          </select>
        </label>
        <label class="flex items-center gap-2">
          <input v-model="saEdit.isActive" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
          <span class="text-sm text-slate-700">{{ t('activeRestaurant') }}</span>
        </label>
        <p v-if="saEditError" class="text-sm text-rose-600">{{ saEditError }}</p>
      </div>
      <template #footer>
        <button class="btn-ghost" :disabled="saSaving" @click="saEdit.open = false">{{ t('cancel') }}</button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          :disabled="saSaving"
          @click="saSave"
        >
          <span v-if="saSaving" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {{ saSaving ? t('saving') : t('save') }}
        </button>
      </template>
    </AdminModal>

    <!-- Delete confirmation modal -->
    <AdminModal v-if="confirmState.open" :title="confirmState.title" @close="confirmState.open = false">
      <div class="flex items-start gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-xl">🗑</div>
        <p class="pt-1.5 text-sm text-slate-600">{{ confirmState.message }}</p>
      </div>
      <template #footer>
        <button class="btn-ghost" :disabled="confirmState.busy" @click="confirmState.open = false">{{ t('cancel') }}</button>
        <button
          class="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="confirmState.busy"
          @click="runConfirm"
        >{{ confirmState.busy ? t('deleting') : t('delete') }}</button>
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
.tl-tag {
  @apply inline-flex w-16 shrink-0 items-center justify-center rounded-md bg-white px-2 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200;
}
.ai-btn {
  @apply inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:-translate-y-px hover:shadow disabled:cursor-not-allowed disabled:opacity-50;
}
.ord-btn {
  @apply flex h-4 w-5 items-center justify-center text-[9px] leading-none text-slate-400 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-25;
}
.btn-primary {
  @apply rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50;
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
