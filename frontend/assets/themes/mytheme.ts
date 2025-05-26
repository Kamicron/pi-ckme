import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      0: 'var(--primary-color)',
      50: 'var(--primary-color)',
      100: 'var(--primary-color)',
      200: 'var(--primary-color)',
      300: 'var(--primary-color)',
      400: 'var(--primary-color)',
      500: 'var(--primary-color)',
      600: 'var(--primary-color)',
      700: 'var(--primary-color)',
      800: 'var(--primary-color)',
      900: 'var(--primary-color)',
      950: 'var(--primary-color)',
    },
    gray: {
      white: '#F4F6F8',
      light: '#c9d6e7',
      medium: '#6c757d',
      dark: '#2c3b4c',
    },
    error: {
      500: '#dc3545'
    },
    success: {
      500: '#28a745'
    },
    warning: {
      500: '#ffc107'
    },
    info: {
      500: '#17a2b8'
    },
    border: {
      radius: {
        medium: '10px 0 10px 0'
      },
      style: {
        light: "5px solid var(--primary-color)",
        medium: "10px solid var(--primary-color)",
      }
    },
    shadow: {
      medium: "0px 4px 6px rgba(0, 0, 0, 0.5)"
    }
  },
  components: {
    button: {
      root: {
        borderRadius: '{semantic.border.radius.medium}',
        shadow: '{semantic.shadow.medium}',
        background: 'var(--primary-color)',
        color: '#000'
      },
      hover: {
        background: 'var(--primary-color)',
        color: '#000'
      },
      severity: {
        error: {
          background: '{semantic.error.500}',
          hover: {
            background: '#ff0000'
          }
        }
      },
      variants: {
        outline: {
          background: 'transparent',
          color: 'var(--primary-color)',
          border: '2px solid var(--primary-color)',
          hover: {
            background: 'var(--primary-color)',
            color: '#000',
            border: '2px solid var(--primary-color)'
          }
        }
      },
      css: ({ dt }) => `
      .p-button {
        color: #000;
      }
      `
    },
    chip: {
      css: ({ dt }) => `
        .p-chip {
          background-color: rgba(var(--primary-color-rgb), 0.2);
          border: 1px solid rgba(var(--primary-color-rgb), 0.4);
          color: var(--primary-color);
          font-weight: bold;
          padding: 0.5rem 1rem;
          border-radius: 999px;
        }
      `
    }
  }
})

export default {
  preset: MyPreset,
  options: {
    darkModeSelector: false
  }
}