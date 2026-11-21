<script setup lang="ts">
defineProps<{ items: Array<{ label: string; icon: string; tone?: 'danger' | 'warning'; disabled?: boolean; action: () => void }> }>()
</script>

<template>
  <q-btn-dropdown class="admin-action-trigger" rounded unelevated no-caps label="Ações" dropdown-icon="keyboard_arrow_down">
    <q-list dense class="admin-action-list">
      <q-item v-for="item in items" :key="item.label" clickable v-close-popup :disable="item.disabled" @click="item.action">
        <q-item-section avatar><span class="admin-action-icon" :class="item.tone"><q-icon :name="item.icon" /></span></q-item-section>
        <q-item-section>{{ item.label }}</q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>
