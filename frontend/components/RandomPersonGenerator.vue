<template>
  <div class="card">
    <div class="person-details" v-if="person">
      <div class="person-header">
        <div class="person-photo">
          <img v-if="person.photoUrl" :src="person.photoUrl" :alt="person.firstName" />
        </div>
        <div class="person-name">
          <h2>{{ person.firstName }} {{ person.lastName }}</h2>
        </div>
      </div>
      <div class="details-section">
        <!-- <div class="detail-row">
          <div class="detail-label">Âge:</div>
          <div class="detail-value">{{ person.age }} ans</div>
        </div> -->
        <div class="detail-row">
          <div class="detail-label">Genre:</div>
          <div class="detail-value">{{ formatGender(person.gender) }}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Nationalité:</div>
          <div class="detail-value">
            <img 
              :src="getFlagUrl(person.nationality.nameFr)" 
              :alt="person.nationality.nameFr"
              class="flag-icon"
            />
            {{person.nationality.nameFr}}
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Ethnicité:</div>
          <div class="detail-value">
            <Chip
              :label="person.ethnicity.nameFr"
              :style="getEthnicityStyle(person.ethnicity.id)"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="loading" class="loading-state">
      Chargement...
    </div>
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>
    <div class="mb-3">
      <Button label="Générer une personne" icon="pi pi-refresh" @click="generatePerson" :loading="loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Person } from '~/types'
import { useFlags } from '~/composables/useFlags'

interface Props {
  ethnicityColorMap: Map<string, { backgroundColor: string; color: string; }>;
}

const props = defineProps<Props>();
const { getFlagUrl } = useFlags()
const person = ref<Person | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const genderIcon = computed(() => {
  return person.value?.gender === 'male' ? 'pi pi-user' : 'pi pi-user-edit';
});

function formatGender(gender: string): string {
  return gender === 'male' ? 'Homme' : 'Femme'
}

function getEthnicityStyle(ethnicityId: string) {
  return props.ethnicityColorMap.get(ethnicityId) || { backgroundColor: '#E0E0E0', color: '#000000' }
}

async function generatePerson() {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await fetch('http://localhost:5001/names/random-person');
    if (!response.ok) {
      throw new Error('Erreur lors de la génération de la personne');
    }
    
    person.value = await response.json();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Une erreur est survenue';
    person.value = null;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.card {
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: var(--surface-card);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.person-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.person-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.person-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
}

.person-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.person-name h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color);
}

.details-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-label {
  font-weight: 600;
  color: var(--text-color-secondary);
  width: 100px;
}

.detail-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color);
}

.flag-icon {
  width: 24px;
  height: 16px;
  object-fit: cover;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.error-state {
  color: var(--red-500);
}
</style>
