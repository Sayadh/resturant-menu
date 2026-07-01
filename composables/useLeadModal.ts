// Shared open-state for the landing "Get started" contact modal, so any CTA
// (nav, hero, pricing, footer CTA) can open it.
export const useLeadModal = () => {
  const open = useState('lead-modal-open', () => false)
  const plan = useState<string>('lead-modal-plan', () => '')

  const openModal = (planName = '') => {
    plan.value = planName
    open.value = true
  }
  const closeModal = () => (open.value = false)

  return { open, plan, openModal, closeModal }
}
