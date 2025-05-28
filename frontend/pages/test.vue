<template>
  <div class="container">

    <div class="grid">
      <!-- Générateur de personnes aléatoires -->
      <div class="col-12">
        <RandomPersonGenerator :ethnicity-color-map="ethnicityColorMap" />
      </div>

      <!-- Statistiques des combinaisons -->
      <div class="col-12">
        <PossibleCombinations />
      </div>
      <!-- Liste des ethnicités -->
      <div class="col-12 md:col-4">
        <EthnicitiesTable :ethnicities="ethnicities" :loading="loading" />
      </div>

      <!-- Liste des nationalités -->
      <div class="col-12 md:col-4">
        <NationalitiesTable :nationalities="nationalities" :loading="loading" />
      </div>

      <!-- Distribution des ethnicités par nationalité -->
      <div class="col-12 md:col-4">
        <DistributionTable :distribution="distribution" :nationalities="nationalities" :loading="loading"
          :ethnicity-color-map="ethnicityColorMap" @nationality-change="onNationalityChange" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import EthnicitiesTable from '~/components/EthnicitiesTable.vue'
import NationalitiesTable from '~/components/NationalitiesTable.vue'
import DistributionTable from '~/components/DistributionTable.vue'
import RandomPersonGenerator from '~/components/RandomPersonGenerator.vue'

interface Ethnicity {
  id: string;
  nameEn: string;
  nameFr: string;
}

interface Nationality {
  id: string;
  nameEn: string;
  nameFr: string;
  ethnicities: Array<{
    id: string;
    nameEn: string;
    nameFr: string;
    percentage: number;
  }>;
}

enum EthnicityType {
  AFRICAN = 'african',
  ASIAN = 'asian',
  CARIBBEAN = 'caribbean',
  EUROPEAN = 'european',
  LATINO = 'latino',
  MIDDLE_EASTERN = 'middle-eastern',
  NATIVE_AMERICAN = 'native-american',
  PACIFIC_ISLANDER = 'pacific-islander',
  SOUTH_ASIAN = 'south-asian',
  SOUTH_EAST_ASIAN = 'south-east-asian',
}

const ethnicities = ref<Ethnicity[]>([])
const nationalities = ref<Nationality[]>([])
const distribution = ref<Nationality[]>([])
const loading = ref(true)
const isDarkMode = ref(false)

// Couleurs pour les ethnicités
const ethnicityColors = {
  [EthnicityType.EUROPEAN]: { backgroundColor: '#90CAF9', color: '#000000' },
  [EthnicityType.AFRICAN]: { backgroundColor: '#A5D6A7', color: '#000000' },
  [EthnicityType.ASIAN]: { backgroundColor: '#FFCC80', color: '#000000' },
  [EthnicityType.LATINO]: { backgroundColor: '#EF9A9A', color: '#000000' },
  [EthnicityType.MIDDLE_EASTERN]: { backgroundColor: '#CE93D8', color: '#000000' },
  [EthnicityType.SOUTH_ASIAN]: { backgroundColor: '#FFB74D', color: '#000000' },
  [EthnicityType.SOUTH_EAST_ASIAN]: { backgroundColor: '#81C784', color: '#000000' },
  [EthnicityType.NATIVE_AMERICAN]: { backgroundColor: '#9FA8DA', color: '#000000' },
  [EthnicityType.PACIFIC_ISLANDER]: { backgroundColor: '#9538DA', color: '#000000' },
  [EthnicityType.CARIBBEAN]: { backgroundColor: '#9FA800', color: '#000000' },
} as const

type EthnicityStyle = { backgroundColor: string; color: string; }
const ethnicityColorMap = computed(() => {
  const map = new Map<string, EthnicityStyle>()
  ethnicities.value.forEach((ethnicity, index) => {
    const colorKey = Object.keys(ethnicityColors)[index % Object.keys(ethnicityColors).length] as keyof typeof ethnicityColors
    map.set(ethnicity.id, ethnicityColors[colorKey])
  })
  return map
})

function assignColorsToEthnicities(ethnicitiesList: Ethnicity[]): void {
  const colorKeys = Object.keys(ethnicityColors)
  ethnicitiesList.forEach((ethnicity, index) => {
    const colorKey = colorKeys[index % colorKeys.length] as keyof typeof ethnicityColors
    ethnicityColorMap.value.set(ethnicity.id, ethnicityColors[colorKey])
  })
}

async function fetchDistribution(nationalityId?: string) {
  try {
    loading.value = true
    const url = new URL('http://localhost:5001/nationalities/distribution')
    if (nationalityId) {
      url.searchParams.append('nationalityId', nationalityId)
    }
    const response = await fetch(url)
    distribution.value = await response.json()
  } catch (error) {
    console.error('Error fetching distribution:', error)
  } finally {
    loading.value = false
  }
}

async function onNationalityChange(nationalityId?: string) {
  await fetchDistribution(nationalityId)
}

async function fetchData() {
  try {
    loading.value = true
    const [ethnicitiesRes, nationalitiesRes] = await Promise.all([
      fetch('http://localhost:5001/ethnicities').then(res => res.json()),
      fetch('http://localhost:5001/nationalities').then(res => res.json())
    ])

    ethnicities.value = ethnicitiesRes
    nationalities.value = nationalitiesRes

    // Assigner les couleurs aux ethnicités après les avoir chargées
    assignColorsToEthnicities(ethnicitiesRes)

    // Charger la distribution initiale
    await fetchDistribution()
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark');
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.container {
  padding: 2rem;
  min-height: 100vh;
  background-color: var(--surface-ground);
}


.card {
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: var(--surface-card);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

:deep(.p-datatable) {
  background-color: var(--surface-card);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

:deep(.p-datatable .p-datatable-header) {
  background-color: var(--surface-section);
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: var(--surface-section);
  color: var(--text-color);
  border-color: var(--surface-border);
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  background-color: var(--surface-card);
  color: var(--text-color);
  border-color: var(--surface-border);
}

:deep(.p-datatable .p-datatable-tbody > tr.p-highlight) {
  background-color: var(--primary-color);
  color: var(--text-color);
}

:deep(.p-datatable.p-datatable-striped .p-datatable-tbody > tr:nth-child(odd)) {
  background-color: var(--datatable-row-odd);
}

:deep(.p-datatable.p-datatable-striped .p-datatable-tbody > tr:nth-child(even)) {
  background-color: var(--datatable-row-even);
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: var(--datatable-row-hover);
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border-color: var(--surface-border);
}

:deep(.p-paginator) {
  background-color: var(--surface-card);
  color: var(--text-color);
  border-color: var(--surface-border);
}

.distribution-row {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: var(--surface-card);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.nationality-name {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.distribution-bars {
  display: flex;
  height: 2rem;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.distribution-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  transition: all 0.3s ease;
}

.color-preview {
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
}
</style>
