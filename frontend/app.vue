<template>
  <div :class="{ 'dark-mode': isDark }">
    <div class="layout-wrapper">
      <div class="layout-menu-button">
        <Button icon="pi pi-bars" @click="visible = true" class="menu-button glassmorphism-button" />
      </div>
      <div class="layout-header">
        <ThemeSwitch />
      </div>
      
      <NavigationMenu v-model:visible="visible" :user="user" />
      
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeSwitch from '~/components/ThemeSwitch.vue'
import NavigationMenu from '~/components/NavigationMenu.vue'
import { ref, computed, onMounted } from 'vue'

const { isDark } = useTheme()
const visible = ref(false)

// Récupération de l'utilisateur connecté
const user = ref(null)

onMounted(() => {
  // Vérifier si l'utilisateur est déjà connecté via localStorage
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    user.value = JSON.parse(storedUser)
  }
})
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

.layout-menu-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
}

.menu-button {
  box-shadow: var(--card-shadow);
}

.glassmorphism-button {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1)) !important;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: none !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.2) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  width: 3rem !important;
  height: 3rem !important;
  border-radius: 50% !important;
}

.glassmorphism-button:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.3) !important;
}

.glassmorphism-button .pi {
  font-size: 1.2rem;
  color: var(--text-color);
}

.dark-mode {
  background-color: var(--surface-ground);
  color: var(--text-color);
  min-height: 100vh;
}

/* Styles pour forcer le thème sombre dans les composants PrimeVue */
:root.dark .p-sidebar,
:root.dark .p-sidebar-content,
:root.dark .p-sidebar-header,
:root.dark .p-sidebar-footer,
:root.dark .p-panelmenu,
:root.dark .p-panelmenu-header,
:root.dark .p-panelmenu-header-link,
:root.dark .p-panelmenu-content,
:root.dark .p-menu,
:root.dark .p-menu-list,
:root.dark .p-menuitem,
:root.dark .p-menuitem-content,
:root.dark .p-menuitem-link,
:root.dark .p-component,
:root.dark .p-component-overlay {
  background-color: var(--surface-card) !important;
  color: var(--text-color) !important;
  border-color: var(--surface-border) !important;
}

:root.dark .p-menuitem-icon,
:root.dark .p-panelmenu-icon,
:root.dark .pi {
  color: var(--text-color) !important;
}

:root.dark .p-menuitem-link:hover,
:root.dark .p-panelmenu-header-link:hover,
:root.dark .p-component:hover {
  background-color: var(--surface-hover) !important;
}

/* Force la couleur de fond des panneaux PrimeVue */
:root.dark .p-sidebar {
  background-color: #1e1e1e !important;
}

:root.dark .p-panelmenu-panel,
:root.dark .p-panelmenu-header,
:root.dark .p-panelmenu-content,
:root.dark .p-menu-overlay {
  background-color: #1e1e1e !important;
}

/* Styles pour le nouveau menu moderne */
.modern-sidebar {
  max-width: 320px;
}

.modern-sidebar .p-sidebar-content {
  padding: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
  background-color: var(--surface-card);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Style pour l'icône du logo */
.text-primary {
  color: var(--primary-color);
}

.text-2xl {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--primary-color);
}

.sidebar-content {
  padding: 1rem 0;
  flex: 1;
  overflow-y: auto;
}

.sidebar-menu {
  border: none;
  background: transparent;
}

.sidebar-menu .p-panelmenu-header-link {
  padding: 0.75rem 1rem;
}

.sidebar-menu .p-menuitem-icon {
  margin-right: 0.5rem;
  color: var(--primary-color);
}

.sidebar-menu .p-panelmenu-header:not(.p-highlight):not(.p-disabled) > a:hover {
  background: var(--surface-hover);
  color: var(--text-color);
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--surface-border);
  background-color: var(--surface-card);
}

.user-profile-container {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-profile-container:hover {
  background-color: var(--surface-hover);
}

.user-info {
  margin-left: 0.75rem;
  flex: 1;
}

.user-info h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
}

.user-info p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}

.user-menu-toggle {
  padding: 0.25rem;
}

.login-button {
  width: 100%;
  margin-top: 0.5rem;
  justify-content: flex-start;
}
</style>
