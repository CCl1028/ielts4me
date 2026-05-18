<template>
  <div class="home-page">
    <n-tabs v-model:value="activeUnit" type="segment" animated>
      <n-tab-pane
        v-for="unit in units"
        :key="unit.id"
        :name="unit.id"
        :tab="unit.name"
      >
        <div class="paper-grid">
          <n-card
            v-for="paper in unit.papers"
            :key="paper.id"
            hoverable
            class="paper-card"
            @click="goToPractice(unit.id, paper.id)"
          >
            <template #header>{{ paper.name }}</template>
            <n-text depth="3">共 {{ paper.wordCount || paper.words.length }} 个词</n-text>
          </n-card>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NTabs, NTabPane, NCard, NText } from 'naive-ui'
import { usePracticeStore } from '../stores/practice'

const router = useRouter()
const store = usePracticeStore()
const units = store.getUnits()
const activeUnit = ref(units[0]?.id || '')

function goToPractice(unitId, paperId) {
  router.push(`/practice/${unitId}/${paperId}`)
}
</script>

<style scoped>
.home-page {
  max-width: 800px;
  margin: 0 auto;
}
.paper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
.paper-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.paper-card:hover {
  transform: translateY(-2px);
}
</style>
