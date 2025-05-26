<template>
  <div class="profile-container" v-if="user">
    <img :src="user.picture" :alt="user.firstName" class="profile-picture" />
    <div class="profile-info">
      <h2>Bienvenue {{ user.firstName }} {{ user.lastName }}</h2>
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
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 500px;
  margin: 20px auto;
}

.profile-picture {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.profile-info p {
  margin: 0;
  color: #666;
}
</style>
