<template>
  <div :class="{ 'dark-mode': isDark }">
    <div class="layout-wrapper">
      <div class="layout-header">
        <ThemeSwitch />
      </div>
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeSwitch from '~/components/ThemeSwitch.vue'
const { isDark } = useTheme()
</script>

<style>
:root {
  /* Light theme variables */
  --surface-ground: #f8f9fa;
  --surface-section: #ffffff;
  --surface-card: #ffffff;
  --surface-overlay: #ffffff;
  --surface-border: #dfe7ef;
  --surface-hover: #f6f9fc;
  --text-color: #495057;
  --text-color-secondary: #6c757d;
  --primary-color: #A3C4F3;
  --card-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
  --border-radius: 6px;
}

:root.dark {
  /* Dark theme variables */
  --surface-ground: #121212;
  --surface-section: #1e1e1e;
  --surface-card: #1e1e1e;
  --surface-overlay: #2b2b2b;
  --surface-border: #404040;
  --surface-hover: #262626;
  --text-color: #f8f9fa;
  --text-color-secondary: #dee2e6;
  --primary-color: #A3C4F3;
  --card-shadow: 0 2px 4px -1px rgba(0,0,0,.5);
  /* Nouvelles variables pour le tableau */
  --datatable-row-odd: #1a1a1a;
  --datatable-row-even: #242424;
  --datatable-row-hover: #2d2d2d;
}

body {
  margin: 0;
  background-color: var(--surface-ground);
  color: var(--text-color);
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.layout-wrapper {
  min-height: 100vh;
  background-color: var(--surface-ground);
}

.layout-header {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

.dark-mode {
  background-color: var(--surface-ground);
  color: var(--text-color);
  min-height: 100vh;
}
</style>
