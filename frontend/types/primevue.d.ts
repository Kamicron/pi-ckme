import { Ref } from 'vue'

declare module '#app' {
  interface NuxtApp {
    $primevue: {
      config: Ref<{
        pt?: any
        [key: string]: any
      }>
    }
  }
}
