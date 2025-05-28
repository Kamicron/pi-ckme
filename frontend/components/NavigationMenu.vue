<template>
  <Sidebar :visible="visible" @update:visible="$emit('update:visible', $event)" class="modern-sidebar" :class="{ 'dark-sidebar': isDark }" :pt="sidebarPT">
    <div class="sidebar-header">
      <div class="logo-container">
        <h2 class="logo-text">Pi-ckme</h2>
      </div>
    </div>

    <div class="sidebar-content">
      <div v-if="user" class="user-profile-container" @click="toggleUserMenu">
        <Avatar :image="user.picture" size="large" shape="circle" />
        <div class="user-info">
          <h3>{{ user.firstName }} {{ user.lastName }}</h3>
          <p>{{ user.email }}</p>
        </div>
        <Button icon="pi pi-angle-down" text rounded class="user-menu-toggle" />
      </div>
      <Menu v-if="user" v-model:popup="userMenuVisible" :model="userMenuItems" ref="userMenu" />
      
      <Button v-if="!user" label="Connexion" icon="pi pi-sign-in" class="login-button glassmorphism-button" @click="login" />

    </div>

    <div class="sidebar-footer">
      <PanelMenu :model="menuItems" class="sidebar-menu" />

    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRuntimeConfig } from 'nuxt/app';
import { useTheme } from '../composables/useTheme';
import Avatar from 'primevue/avatar';

const { isDark } = useTheme();

// Styles personnalisés pour le composant Sidebar
const sidebarPT = computed(() => ({
  root: { class: isDark.value ? 'dark-sidebar-root' : '' },
  content: { class: isDark.value ? 'dark-sidebar-content' : '' },
  header: { class: isDark.value ? 'dark-sidebar-header' : '' },
  footer: { class: isDark.value ? 'dark-sidebar-footer' : '' }
}));
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Menu from 'primevue/menu';
import PanelMenu from 'primevue/panelmenu';
import Sidebar from 'primevue/sidebar';

// Props
const props = defineProps<{
  visible: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    picture: string;
  } | null;
}>();

console.log("props", props);

// Emits
const emit = defineEmits(['update:visible']);

// Refs
const userMenuVisible = ref(false);
const userMenu = ref();

// Structure du menu principal
const menuItems = [
  {
    label: 'Navigation',
    icon: 'pi pi-compass',
    items: [
      {
        label: 'Accueil',
        icon: 'pi pi-home',
        command: () => {
          window.location.href = '/';
        }      },
      {
        label: 'Test',
        icon: 'pi pi-cog',
        command: () => {
          window.location.href = '/test';
        }
      }
    ]
  },
  {
    label: 'Administration',
    icon: 'pi pi-shield',
    items: [
      {
        label: 'Tableau de bord',
        icon: 'pi pi-th-large',
        command: () => {
          window.location.href = '/admin';
        }
      }
    ]
  }
];

// Options du menu utilisateur
const userMenuItems = [
  {
    label: 'Mon profil',
    icon: 'pi pi-user',
    command: () => {
      // Naviguer vers la page profil
    }
  },
  {
    label: 'Paramètres',
    icon: 'pi pi-cog',
    command: () => {
      // Naviguer vers la page paramètres
    }
  },
  {
    separator: true
  },
  {
    label: 'Déconnexion',
    icon: 'pi pi-sign-out',
    command: () => {
      logout();
    }
  }
];

// Fonction de connexion
const config = useRuntimeConfig();
const login = () => {
  // Redirection vers la page d'authentification Google
  window.location.href = `${config.public.apiBaseUrl}/auth/google`;
};

// Fonction de déconnexion
const logout = () => {
  localStorage.removeItem('user');
  // Redirection vers la page d'accueil
  window.location.href = '/';
};

// Afficher le menu utilisateur
const toggleUserMenu = (event: Event) => {
  userMenuVisible.value = !userMenuVisible.value;
  userMenu.value?.toggle(event);
};
</script>

<style scoped lang="scss">
/* Styles pour le nouveau menu moderne */
.modern-sidebar {
  max-width: 320px;
  background-color: var(--surface-card) !important;
  color: var(--text-color) !important;
  border-color: var(--surface-border) !important;
}

.dark-sidebar {
  --p-component-overlay-backdrop: rgba(0, 0, 0, 0.6) !important;
  --p-component-overlay-color: var(--surface-card) !important;
  --p-component-bg: var(--surface-card) !important;
  --p-component-text-color: var(--text-color) !important;
  --p-component-border-color: var(--surface-border) !important;
  --p-component-hover-bg: var(--surface-hover) !important;
}

.dark-sidebar :deep(.p-sidebar) {
  background-color: var(--surface-card) !important;
  color: var(--text-color) !important;
  border-color: var(--surface-border) !important;
}

.dark-sidebar :deep(.p-component),
.dark-sidebar :deep(.p-component-overlay) {
  background-color: var(--surface-card) !important;
  color: var(--text-color) !important;
}

.modern-sidebar :deep(.p-sidebar-content) {
  padding: 0;
}

.modern-sidebar :deep(.p-menu) {
  width: 200px;
  background-color: var(--surface-card) !important;
  color: var(--text-color) !important;
  border-color: var(--surface-border) !important;
}

.modern-sidebar :deep(.p-menu .p-menuitem-link) {
  color: var(--text-color);
}

.modern-sidebar :deep(.p-menu .p-menuitem-link:hover) {
  background-color: var(--surface-hover);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
  background-color: var(--surface-card);
  color: var(--text-color);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

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

.sidebar-menu :deep(.p-panelmenu-panel) {
  background-color: var(--surface-card);
  color: var(--text-color);
}

.sidebar-menu :deep(.p-panelmenu-content) {
  background-color: var(--surface-card);
  color: var(--text-color);
  border-color: var(--surface-border);
}

.sidebar-menu :deep(.p-panelmenu-header-link) {
  padding: 0.75rem 1rem;
  color: var(--text-color);
  background-color: var(--surface-card);
}

.sidebar-menu :deep(.p-menuitem-link) {
  color: var(--text-color);
  background-color: var(--surface-card);
}

.sidebar-menu :deep(.p-menuitem-link:hover) {
  background-color: var(--surface-hover);
}

.sidebar-menu :deep(.p-menuitem-icon) {
  margin-right: 0.5rem;
  color: var(--primary-color);
}

.sidebar-menu :deep(.p-panelmenu-header:not(.p-highlight):not(.p-disabled) > a:hover) {
  background: var(--surface-hover);
  color: var(--text-color);
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--surface-border);
  background-color: var(--surface-card);
  color: var(--text-color);
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

.glassmorphism-button {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1)) !important;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: none !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;

  &:hover {
    transform: scale(1.05);
    background: rgba(255, 255, 255, 0.3) !important;
  }

  .pi {
    font-size: 1rem;
    color: var(--text-color);
  }
}
</style>
