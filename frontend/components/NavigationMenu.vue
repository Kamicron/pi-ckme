<template>
  <Sidebar :visible="visible" @update:visible="$emit('update:visible', $event)" class="modern-sidebar">
    <div class="sidebar-header">
      <div class="logo-container">
        <h2 class="logo-text">Pi-ckme</h2>
      </div>
    </div>

    <div class="sidebar-content">
      <PanelMenu :model="menuItems" class="sidebar-menu" />
    </div>

    <div class="sidebar-footer">
      <Divider />
      <div v-if="user" class="user-profile-container" @click="toggleUserMenu">
        <Avatar :image="user.picture" size="large" shape="circle" />
        <div class="user-info">
          <h3>{{ user.firstName }} {{ user.lastName }}</h3>
          <p>{{ user.email }}</p>
        </div>
        <Button icon="pi pi-angle-down" text rounded class="user-menu-toggle" />
      </div>
      <Menu v-model:popup="userMenuVisible" :model="userMenuItems" ref="userMenu" />
      
      <Button v-if="!user" label="Connexion" icon="pi pi-sign-in" class="login-button" text />
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Avatar from 'primevue/avatar';
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
        to: '/'
      },
      {
        label: 'Connexion',
        icon: 'pi pi-sign-in',
        to: '/login'
      },
      {
        label: 'Test',
        icon: 'pi pi-cog',
        to: '/test'
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
        to: '/admin'
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
      // Déconnecter l'utilisateur
    }
  }
];

// Afficher le menu utilisateur
const toggleUserMenu = (event: Event) => {
  userMenuVisible.value = !userMenuVisible.value;
  userMenu.value?.toggle(event);
};
</script>

<style scoped>
/* Styles pour le nouveau menu moderne */
.modern-sidebar {
  max-width: 320px;
}

.modern-sidebar :deep(.p-sidebar-content) {
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

.sidebar-menu :deep(.p-panelmenu-header-link) {
  padding: 0.75rem 1rem;
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
