import Aura from '@primeuix/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Date de compatibilité Nuxt
  compatibilityDate: '2024-11-01',

  // Configuration de base
  app: {
    head: {
      title: 'Stuffpedia-notion',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://unpkg.com/primeicons/primeicons.css'
        }
      ]
    }
  },

  modules: [
    '@primevue/nuxt-module'
  ],
  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: Aura
      }
    },
    components: {
      include: ['Button', 'DataTable', 'Column', 'Tooltip', 'Chip', 'SpeedDial']
    },
    importTheme: { from: '@/assets/themes/mytheme' }
  },

  // Activation des outils de développement
  devtools: { enabled: true },

  // Configuration du serveur de développement
  devServer: {
    port: parseInt(process.env.FRONT_PORT || '3000'),
  },

  components: [
    { path: '~/components/', pathPrefix: false }
  ],

  imports: {
    dirs: ['composables/**']
  },

  // Gestion des variables d'environnement
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5001'
    }
  },

  // CSS global
  css: [
    '~/assets/css/main.css',
    'primeicons/primeicons.css'
  ]
})
