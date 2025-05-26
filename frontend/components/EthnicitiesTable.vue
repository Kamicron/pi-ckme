<template>
  <div class="card">
    <h2>Ethnicités</h2>
    <DataTable :value="ethnicities" :loading="loading" stripedRows>
      <Column field="nameFr" header="Nom"></Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
interface Ethnicity {
  id: string;
  nameEn: string;
  nameFr: string;
}

defineProps<{
  ethnicities: Ethnicity[];
  loading: boolean;
}>();
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
</style>
