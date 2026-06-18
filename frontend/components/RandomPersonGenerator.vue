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
          <div v-if="person.nickname" class="person-nickname">
            <Tag icon="pi pi-user" severity="info" :value="person.nickname" class="nickname-tag" />
          </div>
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
      
      <!-- Métadonnées du nickname -->
      <div v-if="person.nicknameMeta" class="nickname-meta-section">
        <h4>Détails du pseudo</h4>
        <div class="detail-row">
          <div class="detail-label">Style:</div>
          <div class="detail-value">
            <Tag :value="person.nicknameMeta.style" severity="secondary" class="meta-tag" />
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Pattern:</div>
          <div class="detail-value">
            <Tag :value="person.nicknameMeta.pattern" severity="warning" class="meta-tag" />
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Transformations:</div>
          <div class="detail-value">
            <Tag 
              v-for="(t, i) in person.nicknameMeta.transformations" 
              :key="i"
              :value="t" 
              severity="success" 
              class="meta-tag transformation-tag"
            />
            <span v-if="!person.nicknameMeta.transformations.length" class="no-transform">-</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Lisibilité:</div>
          <div class="detail-value">
            <div class="readability-bar">
              <div 
                class="readability-fill" 
                :style="{ width: person.nicknameMeta.readability + '%' }"
                :class="getReadabilityClass(person.nicknameMeta.readability)"
              ></div>
              <span class="readability-text">{{ person.nicknameMeta.readability }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Portrait Prompt -->
      <div v-if="person.portrait" class="portrait-section">
        <h4>Prompt Portrait</h4>
        <div class="detail-row">
          <div class="detail-label">Forme:</div>
          <div class="detail-value">{{ person.portrait.attributes.faceShape }}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Peau:</div>
          <div class="detail-value">
            <span class="skin-tone-badge" :style="getSkinToneStyle(person.portrait.attributes.skinTone)">
              {{ person.portrait.attributes.skinTone }}
            </span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Cheveux:</div>
          <div class="detail-value">{{ person.portrait.attributes.hairStyle }}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Features:</div>
          <div class="detail-value">{{ person.portrait.attributes.featureVariation }}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">T-shirt:</div>
          <div class="detail-value">
            <span class="tshirt-badge" :style="{ backgroundColor: getTshirtColorHex(person.portrait.attributes.tshirtColor) }">
              {{ person.portrait.attributes.tshirtColor }}
            </span>
          </div>
        </div>
        <div class="prompt-box">
          <div class="prompt-header">
            <span>Prompt complet</span>
            <Button 
              icon="pi pi-copy" 
              severity="secondary" 
              text 
              size="small"
              @click="copyPrompt(person.portrait.prompt)"
              title="Copier le prompt"
            />
          </div>
          <pre class="prompt-text">{{ person.portrait.prompt }}</pre>
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

function getReadabilityClass(readability: number): string {
  if (readability >= 70) return 'readability-high';
  if (readability >= 40) return 'readability-medium';
  return 'readability-low';
}

function getSkinToneStyle(skinTone: string): Record<string, string> {
  const tone = skinTone.toLowerCase();
  if (tone.includes('fair') || tone.includes('porcelain') || tone.includes('light')) {
    return { backgroundColor: '#F5D5C0', color: '#5A3A2A' };
  }
  if (tone.includes('deep') || tone.includes('dark') || tone.includes('ebony')) {
    return { backgroundColor: '#5D3A1A', color: '#FFFFFF' };
  }
  if (tone.includes('olive') || tone.includes('tan')) {
    return { backgroundColor: '#C4956A', color: '#3D2914' };
  }
  if (tone.includes('brown') || tone.includes('bronze')) {
    return { backgroundColor: '#8B5A3C', color: '#FFFFFF' };
  }
  return { backgroundColor: '#D4A574', color: '#4A3018' };
}

function getTshirtColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'navy blue': '#1E3A5F',
    'dark gray': '#4A4A4A',
    'forest green': '#228B22',
    'burgundy': '#800020',
    'black': '#1A1A1A',
    'white': '#F5F5F5',
    'olive green': '#556B2F',
    'charcoal': '#36454F',
    'dark teal': '#014D4E',
    'brown': '#654321',
    'beige': '#F5F5DC',
    'dark blue': '#00008B',
  };
  return colorMap[colorName.toLowerCase()] || '#808080';
}

async function copyPrompt(prompt: string) {
  try {
    await navigator.clipboard.writeText(prompt);
    // Could add a toast notification here
  } catch (err) {
    console.error('Failed to copy:', err);
  }
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

.person-nickname {
  margin-top: 0.5rem;
}

.nickname-tag {
  font-size: 1rem;
  font-weight: 600;
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

.nickname-meta-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--surface-border);
}

.nickname-meta-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-tag {
  font-size: 0.75rem;
  font-weight: 600;
}

:deep(.p-tag) {
  color: var(--text-color) !important;
}

:deep(.p-tag.p-tag-warning) {
  background: var(--orange-100) !important;
  color: var(--orange-900) !important;
}

:deep(.p-tag.p-tag-secondary) {
  background: var(--surface-200) !important;
  color: var(--text-color) !important;
}

:deep(.p-tag.p-tag-success) {
  background: var(--green-100) !important;
  color: var(--green-900) !important;
}

:deep(.p-tag.p-tag-info) {
  background: var(--blue-100) !important;
  color: var(--blue-900) !important;
}

.transformation-tag {
  margin-right: 0.25rem;
}

.no-transform {
  color: var(--text-color-secondary);
  font-style: italic;
}

.readability-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 150px;
}

.readability-fill {
  height: 8px;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.readability-high {
  background-color: var(--green-500);
}

.readability-medium {
  background-color: var(--yellow-500);
}

.readability-low {
  background-color: var(--red-500);
}

.readability-text {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  min-width: 35px;
}

/* Portrait Section */
.portrait-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--surface-border);
}

.portrait-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.skin-tone-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tshirt-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.prompt-box {
  margin-top: 1rem;
  background: var(--surface-100);
  border-radius: 8px;
  overflow: hidden;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--surface-200);
  border-bottom: 1px solid var(--surface-border);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-color-secondary);
}

.prompt-text {
  padding: 0.75rem;
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--text-color);
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
  font-family: monospace;
}
</style>
