export interface DesignMeta {
  id: string
  /** Display name (AM) */
  name: string
  /** Short description (AM) */
  description: string
  /** Accent color for the switcher swatch */
  accent: string
}

// Available designs. Add a new entry here + register its component in
// pages/index.vue's `registry` to make it selectable.
export const designs: DesignMeta[] = [
  {
    id: 'aria',
    name: 'Արիա',
    description: 'Մոդեռն, պրեմիում, պատվերով',
    accent: '#3E2723',
  },
  {
    id: 'atelier',
    name: 'Ատելիե',
    description: 'Խմբագրական, նրբագեղ, ֆայն-դայնինգ',
    accent: '#A1502E',
  },
  {
    id: 'heritage',
    name: 'Ժառանգություն',
    description: 'Տաք, ավանդական, դասական',
    accent: '#C69A5A',
  },
]

const STORAGE_KEY = 'tunlahmajo-design'

export const useDesign = () => {
  const activeDesign = useState<string>('design', () => designs[0]?.id ?? 'heritage')

  const setDesign = (id: string) => {
    if (!designs.find((d) => d.id === id)) return
    activeDesign.value = id
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, id)
  }

  const load = () => {
    if (!import.meta.client) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && designs.find((d) => d.id === saved)) activeDesign.value = saved
  }

  return { designs, activeDesign, setDesign, load }
}
