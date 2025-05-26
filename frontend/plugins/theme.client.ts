export default defineNuxtPlugin(() => {
  if (process.client) {
    const { initTheme } = useTheme()
    // Initialize theme on client-side only
    initTheme()
  }
})
