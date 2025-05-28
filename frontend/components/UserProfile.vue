<template>
  <div class="profile-container" v-if="user">
    <img :src="user.picture" :alt="user.firstName" class="profile-picture" />
    <div class="profile-info">
      <h2>{{ user.firstName }} {{ user.lastName }}</h2>
      <p>{{ user.email }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  user: {
    firstName: string;
    lastName: string;
    email: string;
    picture: string;
  } | null;
}>();
</script>

<style>
.profile-container {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  transition: background-color 0.2s;
  cursor: pointer;
  background-color: var(--surface-card);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.profile-container:hover {
  background-color: var(--surface-hover);
}

.profile-picture {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.75rem;
  border: 2px solid var(--primary-color);
}

.profile-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.profile-info h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.profile-info p {
  font-size: 0.85rem;
  margin: 0;
  color: var(--text-color-secondary);
}

/* Style spécifique pour l'affichage dans le menu */
.user-profile-menu .profile-container {
  border-top: 1px solid var(--surface-border);
  margin-top: auto;
  box-shadow: none;
}
</style>
