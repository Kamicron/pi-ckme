<template>
  <div class="card">
    <h2>Distribution</h2>
    <div class="mb-3">
      <span class="p-float-label">
        <Dropdown
          v-model="selectedNationality"
          :options="nationalities"
          optionLabel="nameFr"
          :filter="true"
          :showClear="true"
          class="w-full"
          @change="$emit('nationalityChange', selectedNationality?.id)"
        >
          <template #value="slotProps">
            <div v-if="slotProps.value">{{ slotProps.value.nameFr }}</div>
            <span v-else>Sélectionnez une nationalité</span>
          </template>
          <template #option="slotProps">
            <div>{{ slotProps.option.nameFr }}</div>
          </template>
        </Dropdown>
        <label>Filtrer par nationalité</label>
      </span>
    </div>
    <DataTable :value="distribution" :loading="loading" stripedRows>
      <Column field="nameFr" header="Nationalité"></Column>
      <Column field="ethnicities" header="Ethnicités">
        <template #body="slotProps">
          <div class="ethnicities-container">
            <Chip 
              v-for="eth in slotProps.data.ethnicities" 
              :key="eth.id"
              :label="`${eth.nameFr} (${eth.percentage}%)`"
              :style="getEthnicityStyle(eth.id)"
              class="mr-2 mb-2"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Ethnicity {
  id: string;
  nameEn: string;
  nameFr: string;
  percentage: number;
}

interface Nationality {
  id: string;
  nameEn: string;
  nameFr: string;
  ethnicities?: Ethnicity[];
}

interface EthnicityStyle {
  backgroundColor: string;
  color: string;
}

const props = defineProps<{
  distribution: Nationality[];
  nationalities: Nationality[];
  loading: boolean;
  ethnicityColorMap: Map<string, EthnicityStyle>;
}>();

const selectedNationality = ref<Nationality | null>(null);

defineEmits<{
  (e: 'nationalityChange', nationalityId?: string): void;
}>();

function getEthnicityStyle(ethnicityId: string): EthnicityStyle {
  return props.ethnicityColorMap.get(ethnicityId) || { backgroundColor: '#E0E0E0', color: '#000000' };
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

h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

:deep(.p-chip) {
  border-radius: 16px;
}

.ethnicities-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 5px;
}

:deep(.p-dropdown) {
  width: 100%;
}
</style>
