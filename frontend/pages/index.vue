<template>
  <div class="home-container">
    <div v-if="user">
      <UserProfile :user="user" />
      <button class="logout-button" @click="logout">Se déconnecter</button>
    </div>
    <div v-else>
      <p>Vous n'êtes pas connecté</p>
      <NuxtLink to="/login" class="login-link">Se connecter</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const user = ref(null);

onMounted(() => {
  // Récupérer les paramètres de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const userParam = urlParams.get('user');
  
  if (userParam) {
    try {
      // Décoder et parser les données utilisateur
      const userData = JSON.parse(decodeURIComponent(userParam));
      user.value = userData;
      
      // Stocker les données dans le localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, '/');
    } catch (error) {
      console.error('Erreur lors du parsing des données utilisateur:', error);
    }
  } else {
    // Vérifier si l'utilisateur est déjà connecté
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user.value = JSON.parse(storedUser);
    }
  }
});

const logout = () => {
  user.value = null;
  localStorage.removeItem('user');
};
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  text-align: center;
}

.logout-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #c82333;
}

.login-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.login-link:hover {
  background-color: #0056b3;
}
</style>