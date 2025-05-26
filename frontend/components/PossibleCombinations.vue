<template>
  <div class="statistics">
    <h2 class="statistics__title">Statistiques des combinaisons</h2>

    <div v-if="loading" class="statistics__loader">
      <ProgressSpinner />
    </div>

    <div v-else class="statistics__content">
      <DataTable :value="[stats]" class="statistics__table" stripedRows>
        <Column field="totalFirstNames" header="Prénoms disponibles">
          <template #body="{ data }">
            <Chip :label="data.totalFirstNames.toLocaleString()" class="statistics__chip" />
          </template>
        </Column>
        <Column field="totalLastNames" header="Noms de famille">
          <template #body="{ data }">
            <Chip :label="data.totalLastNames.toLocaleString()" class="statistics__chip" />
          </template>
        </Column>
        <Column field="totalNationalities" header="Nationalités">
          <template #body="{ data }">
            <Chip :label="data.totalNationalities.toLocaleString()" class="statistics__chip" />
          </template>
        </Column>
      </DataTable>

      <Panel class="statistics__total">
        <div class="statistics__total-content">
          <div class="statistics__total-wrapper">
            <Chip :label="stats.totalCombinations.toLocaleString()" class="statistics__chip statistics__chip--large" />
            <div class="statistics__total-text">
              personnages uniques possibles
            </div>
          </div>
        </div>
      </Panel>

      <div class="statistics__actions">
        <Button icon="pi pi-refresh" 
                label="Actualiser" 
                severity="primary" 
                :loading="loading"
                @click="fetchStats" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ProgressSpinner, DataTable, Column, Chip, Panel, Button } from 'primevue'

interface Stats {
  totalFirstNames: number
  totalLastNames: number
  totalNationalities: number
  totalCombinations: number
}

const stats = ref<Stats>({
  totalFirstNames: 0,
  totalLastNames: 0,
  totalNationalities: 0,
  totalCombinations: 0
})

const loading = ref(true)

const fetchStats = async () => {
  try {
    loading.value = true
    const [firstNamesResponse, lastNamesResponse, nationalitiesResponse] = await Promise.all([
      fetch('http://localhost:5001/first-names/count'),
      fetch('http://localhost:5001/last-names/count'),
      fetch('http://localhost:5001/nationalities/count')
    ])

    const firstNamesCount = await firstNamesResponse.json()
    const lastNamesCount = await lastNamesResponse.json()
    const nationalitiesCount = await nationalitiesResponse.json()

    stats.value = {
      totalFirstNames: firstNamesCount,
      totalLastNames: lastNamesCount,
      totalNationalities: nationalitiesCount,
      totalCombinations: firstNamesCount * lastNamesCount * nationalitiesCount
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style lang="scss">
.statistics {
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  &__title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: var(--text-900);
  }

  &__loader {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }

  &__table {
    margin-bottom: 1.5rem;

    :deep(.p-datatable) {
      background: transparent;

      .p-datatable-thead > tr > th {
        background: transparent;
        color: var(--text-color);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-weight: bold;
      }

      .p-datatable-tbody > tr {
        background: transparent;
        color: var(--text-color);

        &:nth-child(even) {
          background: rgba(255, 255, 255, 0.02);
        }
      }
    }
  }

  &__total {
    margin-top: 1.5rem;

    :deep(.p-panel) {
      background: rgba(255, 255, 255, 0.03);
      border: none;

      .p-panel-content {
        padding: 1.5rem;
      }
    }

    &-content {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &-wrapper {
      display: flex;
      align-items: center;
      gap: 1rem;
      text-align: center;
    }

    &-text {
      color: var(--primary-color);
      font-size: 1.25rem;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  &__chip {
    background-color: rgba(var(--primary-color-rgb), 0.15);
    border: 1px solid rgba(var(--primary-color-rgb), 0.3);
    color: var(--primary-color);
    font-weight: 600;

    &--large {
      font-size: 1.2rem;
      padding: 0.5rem 1rem;
    }
  }
}
</style>
