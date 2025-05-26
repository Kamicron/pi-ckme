import { ref } from 'vue'

export const useTheme = () => {
  const isDark = ref(false)

  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateTheme()
  }

  const updateTheme = () => {
    // Mettre à jour la classe sur le document
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    // Sauvegarder la préférence
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  const initTheme = () => {
    // Récupérer la préférence sauvegardée ou utiliser la préférence système
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    isDark.value = savedTheme 
      ? savedTheme === 'dark'
      : prefersDark

    updateTheme()
  }

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}
