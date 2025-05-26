<template>
  <div class="admin">
    <h1>Administration</h1>

    <TabView>
      <!-- Gestion des prénoms -->
      <TabPanel header="Prénoms" :value="'firstNames'">
        <div class="admin-section">
          <DataTable :value="firstNames" :loading="loading" stripedRows>
            <Column field="name" header="Prénom" />
            <Column field="gender" header="Genre">
              <template #body="{ data }">
                <Tag :value="data.gender === 'male' ? 'Homme' : 'Femme'"
                     :severity="data.gender === 'male' ? 'info' : 'warning'" />
              </template>
            </Column>
            <Column field="ethnicity" header="Ethnie" />
            <Column style="width: 6rem">
              <template #body="{ data }">
                <Button icon="pi pi-trash" 
                       severity="danger" 
                       @click="deleteFirstName(data)" />
              </template>
            </Column>
          </DataTable>

          <div class="admin-form">
            <span class="p-float-label">
              <InputText id="firstName" v-model="newFirstName.name" />
              <label for="firstName">Nouveau prénom</label>
            </span>

            <Dropdown v-model="newFirstName.gender"
                     :options="genderOptions"
                     optionLabel="label"
                     optionValue="value"
                     placeholder="Genre" />

            <Dropdown v-model="newFirstName.ethnicity"
                     :options="ethnicities"
                     optionLabel="name"
                     optionValue="name"
                     placeholder="Ethnie" />

            <Button label="Ajouter" 
                   icon="pi pi-plus" 
                   @click="addFirstName"
                   :disabled="!isValidFirstName" />
          </div>
        </div>
      </TabPanel>

      <!-- Gestion des noms -->
      <TabPanel header="Noms" :value="'lastNames'">
        <div class="admin-section">
          <DataTable :value="lastNames" :loading="loading" stripedRows>
            <Column field="name" header="Nom" />
            <Column field="ethnicity" header="Ethnie" />
            <Column style="width: 6rem">
              <template #body="{ data }">
                <Button icon="pi pi-trash" 
                       severity="danger" 
                       @click="deleteLastName(data)" />
              </template>
            </Column>
          </DataTable>

          <div class="admin-form">
            <span class="p-float-label">
              <InputText id="lastName" v-model="newLastName.name" />
              <label for="lastName">Nouveau nom</label>
            </span>

            <Dropdown v-model="newLastName.ethnicity"
                     :options="ethnicities"
                     optionLabel="name"
                     optionValue="name"
                     placeholder="Ethnie" />

            <Button label="Ajouter" 
                   icon="pi pi-plus" 
                   @click="addLastName"
                   :disabled="!isValidLastName" />
          </div>
        </div>
      </TabPanel>

      <!-- Gestion des nationalités -->
      <TabPanel header="Nationalités" :value="'nationalities'">
        <div class="admin-section">
          <DataTable :value="nationalities" :loading="loading" stripedRows>
            <Column field="name" header="Nationalité" />
            <Column header="Distribution ethnique">
              <template #body="{ data }">
                <div class="admin-chips">
                  <Tag v-for="eth in data.ethnicities" 
                      :key="eth.id"
                      :value="`${eth.name}: ${eth.percentage}%`"
                      severity="info" />
                </div>
              </template>
            </Column>
            <Column style="width: 8rem">
              <template #body="{ data }">
                <Button icon="pi pi-pencil" 
                       class="mr-2"
                       @click="editNationality(data)" />
                <Button icon="pi pi-trash" 
                       severity="danger" 
                       @click="deleteNationality(data)" />
              </template>
            </Column>
          </DataTable>

          <div class="admin-form">
            <span class="p-float-label">
              <InputText id="nationality" v-model="newNationality.name" />
              <label for="nationality">Nouvelle nationalité</label>
            </span>
            <Button label="Ajouter" 
                   icon="pi pi-plus" 
                   @click="addNationality"
                   :disabled="!newNationality.name" />
          </div>
        </div>
      </TabPanel>
    </TabView>

    <!-- Dialog d'édition de nationalité -->
    <Dialog v-model:visible="showDialog" 
            header="Distribution ethnique" 
            modal>
      <div class="distribution-form" v-if="editedNationality">
        <div v-for="eth in editedNationality.ethnicities" 
             :key="eth.id" 
             class="distribution-row">
          <span class="p-float-label">
            <Dropdown v-model="eth.name"
                     :options="ethnicities"
                     optionLabel="name"
                     optionValue="name"
                     placeholder="Sélectionner une ethnie" />
            <label>Ethnie</label>
          </span>

          <span class="p-float-label">
            <InputNumber v-model="eth.percentage" 
                        :min="0" 
                        :max="100"
                        suffix="%" />
            <label>Pourcentage</label>
          </span>

          <Button icon="pi pi-trash" 
                 severity="danger"
                 @click="removeEthnicity(eth)" />
        </div>

        <div class="distribution-actions">
          <Button label="Ajouter une ethnie" 
                 icon="pi pi-plus"
                 @click="addEthnicity"
                 :disabled="editedNationality.ethnicities.length >= ethnicities.length" />
                 
          <div class="distribution-total" :class="{ 'error': totalPercentage !== 100 }">
            Total: {{ totalPercentage }}%
            <small v-if="totalPercentage !== 100">
              (doit être égal à 100%)
            </small>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Annuler" 
               @click="closeDialog" 
               class="p-button-text" />
        <Button label="Sauvegarder" 
               @click="saveNationality" 
               :disabled="!isValidDistribution" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

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

interface FirstName {
  id?: string
  name: string
  gender: 'male' | 'female'
  ethnicity: string
}

interface LastName {
  id?: string
  name: string
  ethnicity: string
}

// Options
const genderOptions = [
  { label: 'Homme', value: 'male' },
  { label: 'Femme', value: 'female' }
]

const ethnicities = [
  { name: 'Européen' },
  { name: 'Africain' },
  { name: 'Asiatique' },
  { name: 'Latino' },
  { name: 'Moyen-Oriental' }
]

// État
const loading = ref(false)
const showDialog = ref(false)

const lastNames = ref<LastName[]>([])
const firstNames = ref<FirstName[]>([])
const nationalities = ref<Nationality[]>([])

const newLastName = ref<LastName>({ name: '', ethnicity: '' })
const newFirstName = ref<FirstName>({ name: '', gender: 'male', ethnicity: '' })
const newNationality = ref<Nationality>({ id: '', name: '', ethnicities: [] })
const editedNationality = ref<Nationality | null>(null)

// Computed
const totalPercentage = computed(() => {
  if (!editedNationality.value) return 0
  return editedNationality.value.ethnicities.reduce((sum, eth) => sum + eth.percentage, 0)
})

const isValidFirstName = computed(() => 
  newFirstName.value.name.trim() && 
  newFirstName.value.gender && 
  newFirstName.value.ethnicity
)

const isValidLastName = computed(() => 
  newLastName.value.name.trim() && 
  newLastName.value.ethnicity
)

const isValidDistribution = computed(() => {
  if (!editedNationality.value) return false
  return totalPercentage.value === 100 && 
         editedNationality.value.ethnicities.every(eth => eth.name && eth.percentage > 0)
})

// Actions pour les prénoms
const addFirstName = async () => {
  if (!isValidFirstName.value) return

  try {
    loading.value = true
    await fetch('http://localhost:5001/first-names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFirstName.value)
    })
    newFirstName.value = { name: '', gender: 'male', ethnicity: '' }
    await fetchFirstNames()
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    loading.value = false
  }
}

const deleteFirstName = async (firstName: FirstName) => {
  if (!firstName.id) return

  try {
    loading.value = true
    await fetch(`http://localhost:5001/first-names/${firstName.id}`, {
      method: 'DELETE'
    })
    await fetchFirstNames()
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    loading.value = false
  }
}

// Actions pour les noms
const addLastName = async () => {
  if (!isValidLastName.value) return

  try {
    loading.value = true
    await fetch('http://localhost:5001/last-names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLastName.value)
    })
    newLastName.value = { name: '', ethnicity: '' }
    await fetchLastNames()
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    loading.value = false
  }
}

const deleteLastName = async (lastName: LastName) => {
  if (!lastName.id) return

  try {
    loading.value = true
    await fetch(`http://localhost:5001/last-names/${lastName.id}`, {
      method: 'DELETE'
    })
    await fetchLastNames()
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    loading.value = false
  }
}

// Actions pour les nationalités
const addNationality = async () => {
  if (!newNationality.value.name.trim()) return

  try {
    loading.value = true
    await fetch('http://localhost:5001/nationalities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNationality.value)
    })
    newNationality.value = { id: '', name: '', ethnicities: [] }
    await fetchNationalities()
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    loading.value = false
  }
}

const deleteNationality = async (nationality: Nationality) => {
  if (!nationality.id) return

  try {
    loading.value = true
    await fetch(`http://localhost:5001/nationalities/${nationality.id}`, {
      method: 'DELETE'
    })
    await fetchNationalities()
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    loading.value = false
  }
}

// Gestion de la distribution
const editNationality = (nationality: Nationality) => {
  editedNationality.value = JSON.parse(JSON.stringify(nationality))
  showDialog.value = true
}

const addEthnicity = () => {
  if (!editedNationality.value) return
  editedNationality.value.ethnicities.push({
    id: crypto.randomUUID(),
    name: '',
    percentage: 0
  })
}

const removeEthnicity = (ethnicity: Ethnicity) => {
  if (!editedNationality.value) return
  editedNationality.value.ethnicities = editedNationality.value.ethnicities.filter(
    eth => eth.id !== ethnicity.id
  )
}

const saveNationality = async () => {
  if (!editedNationality.value || !isValidDistribution.value) return

  try {
    loading.value = true
    await fetch(`http://localhost:5001/nationalities/${editedNationality.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editedNationality.value)
    })
    await fetchNationalities()
    closeDialog()
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  showDialog.value = false
  editedNationality.value = null
}

// Chargement des données
const fetchLastNames = async () => {
  try {
    const response = await fetch('http://localhost:5001/last-names')
    lastNames.value = await response.json()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

const fetchFirstNames = async () => {
  try {
    const response = await fetch('http://localhost:5001/first-names')
    firstNames.value = await response.json()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

const fetchNationalities = async () => {
  try {
    const response = await fetch('http://localhost:5001/nationalities')
    nationalities.value = await response.json()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

// Chargement initial
onMounted(() => {
  fetchLastNames()
  fetchFirstNames()
  fetchNationalities()
})
</script>

<style lang="scss">
.admin {
  padding: 2rem;

  h1 {
    margin-bottom: 2rem;
    color: var(--text-900);
  }
}

.admin-section {
  margin-bottom: 2rem;
}

.admin-form {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  align-items: start;

  .p-float-label,
  .p-dropdown {
    min-width: 200px;
  }
}

.admin-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.distribution-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 600px;
}

.distribution-row {
  display: grid;
  grid-template-columns: 1fr 150px 40px;
  gap: 1rem;
  align-items: start;
}

.distribution-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.distribution-total {
  font-weight: 500;
  color: var(--text-500);

  &.error {
    color: var(--red-500);
  }

  small {
    display: block;
    font-size: 0.875rem;
    opacity: 0.8;
  }
}

:deep(.p-datatable) {
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

:deep(.p-dialog) {
  .p-dialog-header,
  .p-dialog-content,
  .p-dialog-footer {
    background: transparent;
    border: none;
  }
}

:deep(.p-tabview-nav) {
  border: none;
  margin-bottom: 2rem;

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
}

:deep(.p-float-label) {
  .p-dropdown {
    width: 100%;
  }
}
</style>
