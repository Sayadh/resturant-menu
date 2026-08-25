<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────
// OpalineBasketBar — the order dock.
//
// A compact ink pill anchored to the bottom-LEFT corner: it states the count,
// the action and the running total, and nothing else. It sizes to its own
// content instead of spanning the screen, so the menu stays visible around it.
//
// Everything structural — placement, size, the cap that keeps it clear of the
// floating Wi-Fi mark, the colours — lives in this component's own scoped
// stylesheet rather than in arbitrary Tailwind utilities. A control the guest
// needs in order to finish an order must not depend on the utility bundle
// being freshly generated: if it is stale, an arbitrary `bg-[#172033]` or
// `pr-[4.75rem]` silently resolves to nothing, and the dock turns white and
// slides under the Wi-Fi button. Scoped CSS ships with the component itself.
// ─────────────────────────────────────────────────────────────────────────
import { ui } from '~/data/menu'
import { opalineOrder } from '~/themes/opaline/config'

const emit = defineEmits<{ open: [] }>()

const { t } = useLanguage()
const order = useOrderStore()
const brand = useBrand()
const menu = useMenuStore()

// Total is derived from the same store data the drawer uses — no duplicate
// pricing logic, and it honours the tenant's "hide total" setting.
const subtotal = computed(() =>
  order.lines.reduce((sum, l) => sum + (menu.findItem(l.id)?.item.price ?? 0) * l.qty, 0),
)
const fmt = (n: number) => n.toLocaleString('hy-AM')
</script>

<template>
  <ClientOnly>
    <Transition name="op-dock">
      <div v-if="order.count > 0" class="op-dock-wrap" :class="{ 'has-wifi': !!brand.wifiName }">
        <button type="button" class="op-dock-pill" @click="emit('open')">
          <span class="op-dock-count op-figure" aria-hidden="true">{{ order.count }}</span>

          <span class="op-dock-label op-label">{{ t(opalineOrder.view) }}</span>

          <span v-if="brand.showCartTotal" class="op-dock-total op-figure op-sans">
            {{ fmt(subtotal) }} {{ ui.currency.AM }}
          </span>

          <span class="op-dock-chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </Transition>
  </ClientOnly>
</template>

<style scoped>
.op-dock-wrap {
  position: fixed;
  left: 1rem;
  bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  z-index: 45;
  /* Never reach the floating Wi-Fi mark in the opposite corner. */
  max-width: calc(100vw - 2rem);
}
.op-dock-wrap.has-wifi {
  max-width: calc(100vw - 6.75rem);
}
@media (min-width: 640px) {
  .op-dock-wrap {
    left: 1.5rem;
    bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
    max-width: 22rem;
  }
  .op-dock-wrap.has-wifi {
    max-width: 22rem;
  }
}

.op-dock-pill {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.625rem;
  border-radius: 9999px;
  background-color: #172033;
  color: #ffffff;
  padding: 0.3125rem 0.875rem 0.3125rem 0.3125rem;
  text-align: left;
  box-shadow: 0 14px 32px -14px rgba(23, 32, 51, 0.55);
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
}
.op-dock-pill:hover {
  background-color: #222d43;
}
.op-dock-pill:active {
  transform: scale(0.985);
}
.op-dock-pill:focus-visible {
  outline: 2px solid #d85f3d;
  outline-offset: 2px;
}

.op-dock-count {
  display: grid;
  place-items: center;
  flex: none;
  height: 1.875rem;
  width: 1.875rem;
  border-radius: 9999px;
  background-color: #d85f3d;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
}

.op-dock-label {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.5625rem;
  color: #ffffff;
}

.op-dock-total {
  flex: none;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
}

.op-dock-chevron {
  flex: none;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.45);
}
.op-dock-chevron svg {
  height: 0.875rem;
  width: 0.875rem;
}
</style>
