<template>
  <div class="image-uploader">
    <h3>Uploader une image IA</h3>
    
    <div class="upload-form">
      <div class="form-row">
        <div class="form-field">
          <label>Sexe</label>
          <Dropdown
            v-model="selectedSex"
            :options="sexOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Sélectionner le sexe"
            class="w-full"
          />
        </div>
        
        <div class="form-field">
          <label>Ethnicité</label>
          <Dropdown
            v-model="selectedEthnicity"
            :options="ethnicityOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Sélectionner l'ethnicité"
            class="w-full"
            :loading="loadingEthnicities"
          />
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-field file-field">
          <label>Fichier image</label>
          <FileUpload
            mode="basic"
            name="file"
            :customUpload="true"
            @select="onFileSelect"
            @clear="onFileClear"
            accept="image/*"
            :maxFileSize="10000000"
            chooseLabel="Choisir une image"
            class="w-full"
          />
          <small v-if="selectedFile" class="file-name">
            {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
          </small>
        </div>
      </div>
      
      <div class="upload-info" v-if="uploadPath">
        <i class="pi pi-folder-open"></i>
        <span>Dossier: <strong>{{ uploadPath }}</strong></span>
      </div>
      
      <Button
        @click="uploadImage"
        :loading="uploading"
        :disabled="!canUpload"
        label="Uploader"
        icon="pi pi-upload"
        class="w-full"
      />
    </div>
    
    <div v-if="uploadResult" class="upload-result" :class="{ success: uploadResult.success, error: !uploadResult.success }">
      <div v-if="uploadResult.success" class="success-content">
        <i class="pi pi-check-circle"></i>
        <div class="success-details">
          <span>Image uploadée avec succès!</span>
          <small v-if="uploadResult.fileName" class="filename">
            <i class="pi pi-file"></i> {{ uploadResult.fileName }}
          </small>
        </div>
        <div class="image-preview" v-if="uploadResult.url">
          <img :src="uploadResult.url" alt="Uploaded" />
        </div>
      </div>
      <div v-else class="error-content">
        <i class="pi pi-times-circle"></i>
        <span>Erreur: {{ uploadResult.error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl

interface Props {
  prefillSex?: string | null;
  prefillEthnicity?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  prefillSex: null,
  prefillEthnicity: null,
});

interface UploadResult {
  success: boolean;
  fileId?: number;
  fileName?: string;
  url?: string;
  error?: string;
}

const sexOptions = [
  { label: 'Homme', value: 'male' },
  { label: 'Femme', value: 'female' },
];

const ethnicityOptions = ref<Array<{ label: string; value: string }>>([]);
const loadingEthnicities = ref(false);

const selectedSex = ref<string | null>(null);
const selectedEthnicity = ref<string | null>(null);

watch(() => props.prefillSex, (val) => {
  if (val) selectedSex.value = val;
});

watch(() => props.prefillEthnicity, (val) => {
  if (val) selectedEthnicity.value = val;
});
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const uploadResult = ref<UploadResult | null>(null);

const uploadPath = computed(() => {
  if (!selectedSex.value || !selectedEthnicity.value) return null;
  const sexLabel = sexOptions.find(s => s.value === selectedSex.value)?.label;
  return `${sexLabel}/${selectedEthnicity.value}`;
});

const canUpload = computed(() => {
  return selectedSex.value && selectedEthnicity.value && selectedFile.value && !uploading.value;
});

onMounted(async () => {
  await loadEthnicities();
});

async function loadEthnicities() {
  loadingEthnicities.value = true;
  try {
    const response = await fetch(`${apiBase}/ethnicities`);
    const ethnicities = await response.json();
    ethnicityOptions.value = ethnicities.map((eth: any) => ({
      label: eth.nameFr,
      value: eth.nameFr,
    }));
  } catch (e) {
    console.error('Erreur lors du chargement des ethnicités:', e);
  } finally {
    loadingEthnicities.value = false;
  }
}

function onFileSelect(event: any) {
  selectedFile.value = event.files[0];
  uploadResult.value = null;
}

function onFileClear() {
  selectedFile.value = null;
  uploadResult.value = null;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function uploadImage() {
  if (!canUpload.value) return;

  uploading.value = true;
  uploadResult.value = null;

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value!);
    formData.append('sex', selectedSex.value!);
    formData.append('ethnicity', selectedEthnicity.value!);
    formData.append('fileName', selectedFile.value!.name);

    const response = await fetch(`${apiBase}/images/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    uploadResult.value = {
      success: true,
      fileId: result.fileId,
      url: result.url,
    };

    // Reset file after successful upload
    selectedFile.value = null;
  } catch (error: any) {
    uploadResult.value = {
      success: false,
      error: error.message || 'Une erreur est survenue',
    };
  } finally {
    uploading.value = false;
  }
}
</script>

<style scoped>
.image-uploader {
  padding: 1.5rem;
  background: var(--surface-card);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-uploader h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--text-color);
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-field {
  flex: 1;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-color-secondary);
}

.file-field {
  flex: 2;
}

.file-name {
  display: block;
  margin-top: 0.5rem;
  color: var(--text-color-secondary);
}

.upload-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--surface-100);
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.upload-info i {
  color: var(--primary-color);
}

.upload-result {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 6px;
}

.upload-result.success {
  background: var(--green-50);
  border: 1px solid var(--green-200);
}

.upload-result.error {
  background: var(--red-50);
  border: 1px solid var(--red-200);
}

.success-content,
.error-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.success-content {
  flex-wrap: wrap;
}

.success-content i {
  color: var(--green-500);
  font-size: 1.2rem;
}

.success-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filename {
  color: var(--text-color-secondary);
  font-family: monospace;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.filename i {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.error-content i {
  color: var(--red-500);
  font-size: 1.2rem;
}

.image-preview {
  margin-top: 0.75rem;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  object-fit: cover;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
