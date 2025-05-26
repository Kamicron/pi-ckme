import { ref } from 'vue'

interface ThemeColors {
  [key: string]: {
    light: any
    dark: any
  }
}

const themes: ThemeColors = {
  blue: {
    light: {
      primaryColor: '#4318FF',
      components: {
        button: {
          root: {
            backgroundColor: 'var(--primary-color)',
            borderColor: 'var(--primary-color)',
            '&:enabled:hover': {
              backgroundColor: 'var(--primary-color-darker)',
              borderColor: 'var(--primary-color-darker)'
            }
          }
        },
        speeddial: {
          button: {
            backgroundColor: 'var(--primary-color)',
            borderColor: 'var(--primary-color)',
            '&:hover': {
              backgroundColor: 'var(--primary-color-darker)',
              borderColor: 'var(--primary-color-darker)'
            }
          }
        }
      }
    },
    dark: {
      primaryColor: '#4318FF',
      components: {
        button: {
          root: {
            backgroundColor: 'var(--primary-color)',
            borderColor: 'var(--primary-color)',
            '&:enabled:hover': {
              backgroundColor: 'var(--primary-color-darker)',
              borderColor: 'var(--primary-color-darker)'
            }
          }
        },
        speeddial: {
          button: {
            backgroundColor: 'var(--primary-color)',
            borderColor: 'var(--primary-color)',
            '&:hover': {
              backgroundColor: 'var(--primary-color-darker)',
              borderColor: 'var(--primary-color-darker)'
            }
          }
        }
      }
    }
  },
  cyan: {
    light: {
      primaryColor: '#00B5D8',
      // Même structure que blue
    },
    dark: {
      primaryColor: '#00B5D8',
      // Même structure que blue
    }
  },
  green: {
    light: {
      primaryColor: '#05CD99',
      // Même structure que blue
    },
    dark: {
      primaryColor: '#05CD99',
      // Même structure que blue
    }
  },
  orange: {
    light: {
      primaryColor: '#FFB547',
      // Même structure que blue
    },
    dark: {
      primaryColor: '#FFB547',
      // Même structure que blue
    }
  },
  red: {
    light: {
      primaryColor: '#ED2B2B',
      // Même structure que blue
    },
    dark: {
      primaryColor: '#ED2B2B',
      // Même structure que blue
    }
  }
}

export const useThemeConfig = () => {
  const currentTheme = ref('blue')

  const updateTheme = (color: string) => {
    const themeKey = Object.keys(themes).find(
      key => themes[key].light.primaryColor === color
    )
    if (themeKey) {
      currentTheme.value = themeKey
      const theme = themes[themeKey]
      document.documentElement.style.setProperty('--primary-color', color)
      document.documentElement.style.setProperty(
        '--primary-color-darker',
        adjustColor(color, -10)
      )
      
      // Mettre à jour le thème PrimeVue
      const isDark = document.documentElement.classList.contains('dark')
      return isDark ? theme.dark : theme.light
    }
  }

  // Fonction utilitaire pour ajuster la luminosité d'une couleur
  const adjustColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return '#' + (
      0x1000000 +
      (Math.min(Math.max(R, 0), 255)) * 0x10000 +
      (Math.min(Math.max(G, 0), 255)) * 0x100 +
      (Math.min(Math.max(B, 0), 255))
    ).toString(16).slice(1)
  }

  return {
    currentTheme,
    updateTheme,
    themes
  }
}
