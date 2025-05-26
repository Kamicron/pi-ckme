<template>
  <button @click="handleGoogleLogin" class="google-button">
    <img src="/google-icon.svg" alt="Google logo" class="google-icon" />
    Se connecter avec Google
  </button>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const handleGoogleLogin = () => {
  window.location.href = `${config.public.apiBaseUrl}/auth/google`
}
</script>
