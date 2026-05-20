<template>
  <div class="home-page">
    <div class="welcome-section">
      <h1 class="welcome-title">选择练习内容</h1>
      <p class="welcome-desc">选择一个章节和试卷，开始今天的听写训练吧</p>
    </div>

    <div class="content-card">
      <n-tabs v-model:value="activeUnit" type="segment" animated>
        <n-tab-pane
          v-for="unit in units"
          :key="unit.id"
          :name="unit.id"
          :tab="unit.name"
        >
          <div class="paper-grid">
            <div
              v-for="paper in unit.papers"
              :key="paper.id"
              class="paper-card"
              @click="goToPractice(unit.id, paper.id)"
            >
              <div class="paper-card-inner">
                <div class="paper-name">{{ paper.name }}</div>
                <div class="paper-info">
                  <span class="word-count">{{ paper.wordCount || paper.words.length }} 词</span>
                  <span class="practice-count" :class="{ 'not-practiced': getPracticeCount(paper.id) === 0 }">
                    {{ getPracticeCount(paper.id) === 0 ? '未练习' : '已练 ' + getPracticeCount(paper.id) + ' 次' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NTabs, NTabPane } from 'naive-ui'
import { usePracticeStore } from '../stores/practice'
import { getHistory } from '../utils/storage'

const router = useRouter()
const store = usePracticeStore()
const units = store.getUnits()
const activeUnit = ref(units[0]?.id || '')
const history = getHistory()

function getPracticeCount(paperId) {
  return history.filter(r => r.paperId === paperId).length
}

function goToPractice(unitId, paperId) {
  router.push(`/practice/${unitId}/${paperId}`)
}
</script>

<style scoped>
.home-page {
  max-width: 800px;
  margin: 0 auto;
}
.welcome-section {
  text-align: center;
  margin-bottom: 32px;
}
.welcome-title {
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.welcome-desc {
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
  margin: 0;
}
.content-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
.content-card :deep(.n-tabs-tab--active) {
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  color: #fff !important;
  font-weight: 700;
  border-radius: 8px;
}
.content-card :deep(.n-tabs-tab--active .n-tabs-tab__label) {
  color: #fff !important;
}
.content-card :deep(.n-tabs-rail__content) {
  background: transparent !important;
}
.content-card :deep(.n-tabs .n-tabs-rail .n-tabs-capsule) {
  background: transparent !important;
  box-shadow: none !important;
}
.paper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.paper-card {
  cursor: pointer;
  transition: all 0.25s ease;
  border-radius: 12px;
  overflow: hidden;
}
.paper-card:hover {
  transform: translateY(-3px);
}
.paper-card:hover .paper-card-inner {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}
.paper-card:hover .paper-info {
  color: rgba(255, 255, 255, 0.8);
}
.paper-card-inner {
  padding: 16px;
  background: rgba(248, 249, 255, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(232, 236, 244, 0.6);
  transition: all 0.25s ease;
}
.paper-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}
.paper-info {
  color: #999;
  font-size: 12px;
  transition: color 0.25s ease;
}
.word-count {
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: #667eea;
}
.paper-card:hover .word-count {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}
.practice-count {
  margin-left: 6px;
  background: rgba(24, 160, 88, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: #18a058;
  font-weight: 500;
}
.practice-count.not-practiced {
  background: rgba(0, 0, 0, 0.05);
  color: #bbb;
}
.paper-card:hover .practice-count {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}
</style>
