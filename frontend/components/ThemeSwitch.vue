<template>
  <div class="settings-container">
    <SpeedDial class="test" :model="items" :radius="100" buttonClass="p-button-rounded settings-trigger"
      :buttonStyle="buttonStyle" showIcon="pi pi-cog" hideIcon="pi pi-times" type="quarter-circle" direction="down-left"
      :pt="{
        root: { style: 'border-radius: 100%; display:block' },
      }" />

    <!-- Color Picker Popup -->
    <div v-if="showColorPicker" class="color-picker-popup" :style="colorPickerPosition">
      <div class="color-options">
        <button v-for="color in colorOptions" :key="color" class="color-option" :style="{ backgroundColor: color }"
          @click="setPrimaryColor(color)"></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MenuItem } from 'primevue/menuitem'
import type { MenuItemCommandEvent } from 'primevue/menuitem'

const { isDark, toggleTheme } = useTheme()
const showColorPicker = ref(false)
const colorPickerPosition = ref({ top: '0px', left: '0px' })


const fontSize = ref(16)
const colorOptions = ['#A3C4F3', '#90E0EF', '#B9FBC0', '#FFE9A7', '#FFB3C6'];

const buttonStyle = computed(() => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))',
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
  width: '3rem',
  height: '3rem'
}))

onMounted(() => {
  setPrimaryColor('#A3C4F3')
})

const changeFontSize = (increment: number) => {
  fontSize.value = Math.min(Math.max(fontSize.value + increment, 12), 24)
  document.documentElement.style.fontSize = `${fontSize.value}px`
}

const toggleColorPicker = (event: MenuItemCommandEvent) => {
  showColorPicker.value = !showColorPicker.value
  if (showColorPicker.value && event.originalEvent?.target instanceof HTMLElement) {
    const rect = event.originalEvent.target.getBoundingClientRect()
    colorPickerPosition.value = {
      top: `${rect.top + rect.height + 5}px`,
      left: `${rect.left - 180}px` // Décalage plus important vers la gauche
    }
  }
}

const setPrimaryColor = (color: string) => {
  document.documentElement.style.setProperty('--primary-color', color)
  document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(color))
  showColorPicker.value = false
}

function hexToRgb(hex: string): string {
  const value = hex.replace('#', '')
  const bigint = parseInt(value, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  console.log('hexToRgb', `${r}, ${g}, ${b}`);
  
  return `${r}, ${g}, ${b}`
}


const items = computed<MenuItem[]>(() => [
  {
    label: 'Thème',
    icon: isDark.value ? 'pi pi-sun' : 'pi pi-moon',
    command: () => toggleTheme()
  },
  {
    label: 'Couleur',
    icon: 'pi pi-palette',
    command: toggleColorPicker
  },
  {
    label: 'Réduire police',
    icon: 'pi pi-minus',
    command: () => changeFontSize(-1)
  },
  {
    label: 'Augmenter police',
    icon: 'pi pi-plus',
    command: () => changeFontSize(1)
  }
])
</script>

<style scoped lang="scss">
.settings-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

.p-speeddial.p-component.p-speeddial-quarter-circle.p-speeddial-direction-down-left.test {
  display: block !important;
  border-radius: 100% !important;
}

.color-picker-popup {
  position: fixed;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1001;

  .color-options {
    display: flex;
    gap: 0.5rem;

    .color-option {
      width: 2rem;
      height: 2rem;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
}

:deep(.p-speeddial) {
  .p-speeddial-button {
    width: 3rem !important;
    height: 3rem !important;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1)) !important;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: none !important;
    outline: none !important;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.2) !important;
    
    &:hover {
      transform: scale(1.05);
    }
    
    &:focus,
    &:active,
    &:focus-visible {
      outline: none !important;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.2) !important;
      border: none !important;
    }

    .pi {
      font-size: 1.2rem;
      color: var(--text-color);
    }
  }

  .p-speeddial-action {
    width: 2.5rem !important;
    height: 2.5rem !important;
    background: rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    
    &:hover {
      transform: scale(1.1);
      background: rgba(255, 255, 255, 0.3) !important;
    }

    .pi {
      font-size: 1rem;
      color: var(--text-color);
    }
  }
}
</style>
