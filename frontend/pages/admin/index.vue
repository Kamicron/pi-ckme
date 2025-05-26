<template>
  <div class="admin">
    <h1 class="admin__title">Administration</h1>

    <div class="admin__content">
      <TabView>
        <TabPanel header="Noms">
          <div class="admin__section">
            <h2 class="admin__section-title">Gestion des noms</h2>
            <div class="admin__form">
              <span class="p-float-label">
                <InputText id="lastName" v-model="newLastName" />
                <label for="lastName">Nom de famille</label>
              </span>
              <Button label="Ajouter" icon="pi pi-plus" @click="addLastName" />
            </div>
            <DataTable :value="lastNames" class="admin__table" v-model:selection="selectedLastNames">
              <Column selectionMode="multiple" />
              <Column field="name" header="Nom" />
              <Column :exportable="false" style="min-width: 8rem">
                <template #body="slotProps">
                  <Button icon="pi pi-trash" severity="danger" @click="deleteLastName(slotProps.data)" />
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>

        <TabPanel header="Prénoms">
          <div class="admin__section">
            <h2 class="admin__section-title">Gestion des prénoms</h2>
            <div class="admin__form">
              <span class="p-float-label">
                <InputText id="firstName" v-model="newFirstName" />
                <label for="firstName">Prénom</label>
              </span>
              <Button label="Ajouter" icon="pi pi-plus" @click="addFirstName" />
            </div>
            <DataTable :value="firstNames" class="admin__table" v-model:selection="selectedFirstNames">
              <Column selectionMode="multiple" />
              <Column field="name" header="Prénom" />
              <Column :exportable="false" style="min-width: 8rem">
                <template #body="slotProps">
                  <Button icon="pi pi-trash" severity="danger" @click="deleteFirstName(slotProps.data)" />
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>

        <TabPanel header="Nationalités">
          <div class="admin__section">
            <h2 class="admin__section-title">Gestion des nationalités</h2>
            <div class="admin__form">
              <span class="p-float-label">
                <InputText id="nationality" v-model="newNationality.name" />
                <label for="nationality">Nationalité</label>
              </span>
              <Button label="Ajouter" icon="pi pi-plus" @click="addNationality" />
            </div>
            <DataTable :value="nationalities" class="admin__table" v-model:selection="selectedNationalities">
              <Column selectionMode="multiple" />
              <Column field="name" header="Nationalité" />
              <Column field="distribution" header="Distribution">
                <template #body="slotProps">
                  <div class="admin__ethnicities">
                    <Chip v-for="eth in slotProps.data.ethnicities" 
                          :key="eth.id" 
                          :label="`${eth.name} (${eth.percentage}%)`" />
                  </div>
                </template>
              </Column>
              <Column :exportable="false" style="min-width: 8rem">
                <template #body="slotProps">
                  <Button icon="pi pi-pencil" 
                         class="mr-2"
                         @click="editDistribution(slotProps.data)" />
                  <Button icon="pi pi-trash" 
                         severity="danger" 
                         @click="deleteNationality(slotProps.data)" />
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>
      </TabView>
    </div>

    <!-- Dialog pour éditer la distribution -->
    <Dialog v-model:visible="showDistributionDialog" 
            modal 
            header="Éditer la distribution ethnique" 
            :style="{ width: '50vw' }">
      <div class="admin__distribution-form" v-if="selectedNationality">
        <div v-for="eth in selectedNationality.ethnicities" :key="eth.id" class="admin__distribution-item">
          <span class="p-float-label">
            <InputText :id="'eth-' + eth.id" v-model="eth.name" />
            <label :for="'eth-' + eth.id">Ethnie</label>
          </span>
          <span class="p-float-label">
            <InputNumber :id="'pct-' + eth.id" 
                        v-model="eth.percentage" 
                        :min="0" 
                        :max="100" />
            <label :for="'pct-' + eth.id">Pourcentage</label>
          </span>
          <Button icon="pi pi-trash" 
                 severity="danger" 
                 @click="removeEthnicity(eth)" />
        </div>
        <Button label="Ajouter une ethnie" 
                icon="pi pi-plus" 
                @click="addEthnicity" 
                class="mt-3" />
      </div>
      <template #footer>
        <Button label="Annuler" 
                icon="pi pi-times" 
                @click="closeDistributionDialog" 
                class="p-button-text" />
        <Button label="Sauvegarder" 
                icon="pi pi-check" 
                @click="saveDistribution" 
                :disabled="!isDistributionValid" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TabView, TabPanel, DataTable, Column, Button, Dialog, InputText, InputNumber, Chip } from 'primevue'

interface Ethnicity {
  id: string
  name: string
  percentage: number
}

interface Nationality {
  id: string
  name: string
  ethnicities: Ethnicity[]
}

// États
const newLastName = ref('')
const newFirstName = ref('')
const newNationality = ref({ name: '', ethnicities: [] })

const lastNames = ref([])
const firstNames = ref([])
const nationalities = ref([])

const selectedLastNames = ref([])
const selectedFirstNames = ref([])
const selectedNationalities = ref([])

const showDistributionDialog = ref(false)
const selectedNationality = ref<Nationality | null>(null)

// Validation de la distribution
const isDistributionValid = computed(() => {
  if (!selectedNationality.value?.ethnicities.length) return false
  
  const total = selectedNationality.value.ethnicities.reduce(
    (sum, eth) => sum + eth.percentage, 
    0
  )
  
  return total === 100 && selectedNationality.value.ethnicities.every(
    eth => eth.name.trim() !== '' && eth.percentage > 0
  )
})

// Fonctions CRUD pour les noms
const addLastName = async () => {
  if (!newLastName.value.trim()) return
  
  try {
    await fetch('http://localhost:5001/last-names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newLastName.value })
    })
    
    newLastName.value = ''
    await fetchLastNames()
  } catch (error) {
    console.error('Erreur lors de l\'ajout du nom:', error)
  }
}

const deleteLastName = async (lastName: any) => {
  try {
    await fetch(`http://localhost:5001/last-names/${lastName.id}`, {
      method: 'DELETE'
    })
    await fetchLastNames()
  } catch (error) {
    console.error('Erreur lors de la suppression du nom:', error)
  }
}

// Fonctions CRUD pour les prénoms
const addFirstName = async () => {
  if (!newFirstName.value.trim()) return
  
  try {
    await fetch('http://localhost:5001/first-names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newFirstName.value })
    })
    
    newFirstName.value = ''
    await fetchFirstNames()
  } catch (error) {
    console.error('Erreur lors de l\'ajout du prénom:', error)
  }
}

const deleteFirstName = async (firstName: any) => {
  try {
    await fetch(`http://localhost:5001/first-names/${firstName.id}`, {
      method: 'DELETE'
    })
    await fetchFirstNames()
  } catch (error) {
    console.error('Erreur lors de la suppression du prénom:', error)
  }
}

// Fonctions pour la gestion des nationalités
const addNationality = async () => {
  if (!newNationality.value.name.trim()) return
  
  try {
    await fetch('http://localhost:5001/nationalities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNationality.value)
    })
    
    newNationality.value = { name: '', ethnicities: [] }
    await fetchNationalities()
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la nationalité:', error)
  }
}

const deleteNationality = async (nationality: any) => {
  try {
    await fetch(`http://localhost:5001/nationalities/${nationality.id}`, {
      method: 'DELETE'
    })
    await fetchNationalities()
  } catch (error) {
    console.error('Erreur lors de la suppression de la nationalité:', error)
  }
}

// Gestion de la distribution ethnique
const editDistribution = (nationality: Nationality) => {
  selectedNationality.value = JSON.parse(JSON.stringify(nationality))
  showDistributionDialog.value = true
}

const addEthnicity = () => {
  if (!selectedNationality.value) return
  
  selectedNationality.value.ethnicities.push({
    id: crypto.randomUUID(),
    name: '',
    percentage: 0
  })
}

const removeEthnicity = (ethnicity: Ethnicity) => {
  if (!selectedNationality.value) return
  
  selectedNationality.value.ethnicities = selectedNationality.value.ethnicities.filter(
    eth => eth.id !== ethnicity.id
  )
}

const saveDistribution = async () => {
  if (!selectedNationality.value || !isDistributionValid.value) return
  
  try {
    await fetch(`http://localhost:5001/nationalities/${selectedNationality.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedNationality.value)
    })
    
    await fetchNationalities()
    closeDistributionDialog()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la distribution:', error)
  }
}

const closeDistributionDialog = () => {
  showDistributionDialog.value = false
  selectedNationality.value = null
}

// Chargement initial des données
const fetchLastNames = async () => {
  try {
    const response = await fetch('http://localhost:5001/last-names')
    lastNames.value = await response.json()
  } catch (error) {
    console.error('Erreur lors du chargement des noms:', error)
  }
}

const fetchFirstNames = async () => {
  try {
    const response = await fetch('http://localhost:5001/first-names')
    firstNames.value = await response.json()
  } catch (error) {
    console.error('Erreur lors du chargement des prénoms:', error)
  }
}

const fetchNationalities = async () => {
  try {
    const response = await fetch('http://localhost:5001/nationalities')
    nationalities.value = await response.json()
  } catch (error) {
    console.error('Erreur lors du chargement des nationalités:', error)
  }
}

// Chargement initial
onMounted(() => {
  fetchLastNames()
  fetchFirstNames()
  fetchNationalities()
})
</script>

<style lang="scss" scoped>
.admin {
  padding: 2rem;

  &__title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 2rem;
    color: var(--text-900);
  }

  &__content {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(8px);
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__section {
    &-title {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      color: var(--text-700);
    }
  }

  &__form {
    display: flex;
    gap: 1rem;
    align-items: start;
    margin-bottom: 2rem;

    .p-float-label {
      flex: 1;
    }
  }

  &__table {
    margin-bottom: 2rem;
  }

  &__ethnicities {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__distribution {
    &-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    &-item {
      display: grid;
      grid-template-columns: 1fr 150px 40px;
      gap: 1rem;
      align-items: start;
    }
  }
}

:deep {
  .p-tabview-nav {
    border: none;
    margin-bottom: 2rem;
  }

  .p-tabview-nav-link {
    background: transparent !important;
    border: none !important;
    color: var(--text-500);
    
    &:not(.p-disabled):focus {
      box-shadow: none;
    }
  }

  .p-tabview-selected .p-tabview-nav-link {
    color: var(--primary-color) !important;
  }

  .p-tabview-ink-bar {
    background-color: var(--primary-color);
  }

  .p-datatable {
    background: transparent;

    .p-datatable-thead > tr > th {
      background: transparent;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .p-datatable-tbody > tr {
      background: transparent;

      > td {
        border: none;
      }

      &:nth-child(even) {
        background: rgba(255, 255, 255, 0.02);
      }
    }
  }

  .p-dialog {
    .p-dialog-header {
      background: transparent;
      border: none;
    }

    .p-dialog-content {
      background: transparent;
      border: none;
    }

    .p-dialog-footer {
      background: transparent;
      border: none;
      text-align: right;
    }
  }
}
</style>
