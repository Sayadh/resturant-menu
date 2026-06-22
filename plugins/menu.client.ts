// Hydrate the menu store from localStorage on the client so admin edits persist
// across reloads and show up on the public site.
export default defineNuxtPlugin(() => {
  useMenuStore().load()
})
