import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use 'sass:math';
          @import "@/assets/styles/_variables.scss";
        `
      }
    }
  }
})
