<template>
  <div class="card">
    <div class="filter-section">
      <h3>Filtres</h3>
      <div class="filter-row">
        <div class="filter-label">Genre:</div>
        <div class="filter-value">
          <Dropdown v-model="selectedGender" :options="genderOptions" optionLabel="label" 
            optionValue="value" placeholder="Aléatoire" class="w-full" />
        </div>
      </div>
      <div class="filter-row">
        <div class="filter-label">Nationalité:</div>
        <div class="filter-value">
          <Dropdown v-model="selectedNationality" :options="nationalityOptions" optionLabel="label" 
            optionValue="value" placeholder="Aléatoire" class="w-full" @change="onNationalityChange" />
        </div>
      </div>
      <div class="filter-row">
        <div class="filter-label">Ethnicité:</div>
        <div class="filter-value">
          <Dropdown v-model="selectedEthnicity" :options="ethnicityOptions" optionLabel="label" 
            optionValue="value" placeholder="Aléatoire" class="w-full" />
        </div>
      </div>
      <div class="filter-actions">
        <Button label="Générer une personne" icon="pi pi-refresh" @click="generatePerson" :loading="loading" />
      </div>
    </div>
    
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

// Filtres
const selectedGender = ref<string | null>(null);
const selectedNationality = ref<string | null>(null);
const selectedEthnicity = ref<string | null>(null);

// Options pour les filtres
const genderOptions = [
  { label: 'Homme', value: 'male' },
  { label: 'Femme', value: 'female' }
];

const nationalityOptions = ref<Array<{ label: string, value: string }>>([]);
const ethnicityOptions = ref<Array<{ label: string, value: string }>>([]);

// Charger les options de nationalité et d'ethnicité au démarrage
onMounted(async () => {
  try {
    // Charger les nationalités
    const nationalitiesResponse = await fetch('http://localhost:5001/nationalities');
    const nationalities = await nationalitiesResponse.json();
    nationalityOptions.value = nationalities.map((nat: any) => ({
      label: nat.nameFr,
      value: nat.id
    }));
    
    // Charger toutes les ethnicités disponibles
    const ethnicitiesResponse = await fetch('http://localhost:5001/ethnicities');
    const ethnicities = await ethnicitiesResponse.json();
    ethnicityOptions.value = ethnicities.map((eth: any) => ({
      label: eth.nameFr,
      value: eth.id
    }));
  } catch (e) {
    console.error('Erreur lors du chargement des données:', e);
  }
});

// Fonction appelée lorsque la nationalité change (ne modifie plus les ethnicités disponibles)
async function onNationalityChange() {
  // Cette fonction ne fait plus rien de spécial puisque nous voulons permettre
  // la sélection de n'importe quelle ethnicité indépendamment de la nationalité
  // Nous la gardons au cas où nous voudrions ajouter une logique supplémentaire plus tard
}

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
    
    // Construire l'URL avec les paramètres de filtre
    let url = 'http://localhost:5001/names/random-person';
    const params = new URLSearchParams();
    
    if (selectedGender.value) {
      params.append('gender', selectedGender.value);
    }
    
    if (selectedNationality.value) {
      params.append('nationalityId', selectedNationality.value);
    }
    
    if (selectedEthnicity.value) {
      params.append('ethnicityId', selectedEthnicity.value);
    }
    
    // Ajouter les paramètres à l'URL si nécessaire
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const response = await fetch(url);
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

.filter-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.filter-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: var(--text-color);
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-label {
  font-weight: 600;
  color: var(--text-color-secondary);
  width: 120px;
}

.filter-value {
  flex: 1;
}

.filter-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
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
