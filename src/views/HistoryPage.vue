<template>
  <div class="history-page">
    <div class="history-card">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="history" tab="练习记录">
          <div v-if="history.length === 0" class="empty-state">
            <n-empty description="暂无练习记录" />
          </div>
          <div v-else class="record-list">
            <div class="export-bar">
              <n-button size="small" @click="exportExcel">导出全部记录为 Excel</n-button>
            </div>
            <n-collapse>
              <n-collapse-item
                v-for="record in history"
                :key="record.id"
                :name="record.id"
              >
                <template #header>
                  <div class="record-header">
                    <span class="record-title">{{ record.unitName }} - {{ record.paperName }}</span>
                    <span class="record-date">{{ formatDate(record.date) }}</span>
                  </div>
                </template>
                <template #header-extra>
                  <n-tag :type="getTagType(record.score, record.total)" size="small" round>
                    {{ record.score }}/{{ record.total }} ({{ Math.round(record.score / record.total * 100) }}%)
                  </n-tag>
                </template>
                <div class="record-detail">
                  <div
                    v-for="(answer, index) in record.answers"
                    :key="index"
                    class="detail-item"
                    :class="{ 'detail-correct': isCorrect(answer, record, index), 'detail-wrong': !isCorrect(answer, record, index) }"
                  >
                    <span class="detail-index">{{ index + 1 }}</span>
                    <span v-if="isCorrect(answer, record, index)" class="correct-text">
                      ✓ {{ answer }}
                    </span>
                    <span v-else class="wrong-text">
                      ✗ <span class="user-ans">{{ answer === '__SKIP__' ? '(不会)' : answer === '__BLANK__' ? '(漏听)' : answer }}</span> → <span class="correct-ans">{{ getCorrectWord(record, index) }}</span>
                    </span>
                    <span class="detail-meaning">{{ getMeaning(record, index) }}</span>
                  </div>
                </div>
              </n-collapse-item>
            </n-collapse>
          </div>
        </n-tab-pane>

        <n-tab-pane name="wrong-words" tab="错词统计">
          <div v-if="wrongWordsList.length === 0" class="empty-state">
            <n-empty description="暂无错词记录" />
          </div>
          <n-data-table
            v-else
            :columns="wrongColumns"
            :data="wrongWordsList"
            :pagination="{ pageSize: 20 }"
            :bordered="false"
          />
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  NTabs, NTabPane, NCollapse, NCollapseItem, NTag,
  NEmpty, NDataTable
} from 'naive-ui'
import { getHistory, getWrongWords } from '../utils/storage'
import corpus from '../data/corpus.json'

const activeTab = ref('history')
const history = ref(getHistory())

const wrongColumns = [
  { title: '单词', key: 'word', sorter: 'default' },
  { title: '错误次数', key: 'count', sorter: (a, b) => a.count - b.count, defaultSortOrder: 'descend' },
  { title: '最近错误', key: 'lastDate', sorter: 'default' }
]

const wrongWordsList = computed(() => {
  const words = getWrongWords()
  return Object.entries(words)
    .map(([word, data]) => ({ word, ...data }))
    .sort((a, b) => b.count - a.count)
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getTagType(score, total) {
  const p = score / total
  if (p >= 0.8) return 'success'
  if (p >= 0.6) return 'warning'
  return 'error'
}

function getCorrectWord(record, index) {
  const unit = corpus.units.find(u => u.id === record.unitId)
  if (!unit) return null
  const paper = unit.papers.find(p => p.id === record.paperId)
  if (!paper) return null
  return paper.words[index] || null
}

function isCorrect(answer, record, index) {
  const correct = getCorrectWord(record, index)
  if (!correct) return false
  return answer.trim().toLowerCase() === correct.trim().toLowerCase()
}

function getMeaning(record, index) {
  const unit = corpus.units.find(u => u.id === record.unitId)
  if (!unit) return ''
  const paper = unit.papers.find(p => p.id === record.paperId)
  if (!paper || !paper.meanings) return ''
  return paper.meanings[index] || ''
}
</script>

<style scoped>
.history-page {
  max-width: 800px;
  margin: 0 auto;
}
.history-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
.empty-state {
  padding: 40px 0;
}
.record-list {
  margin-top: 8px;
}
.export-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
.record-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.record-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}
.record-date {
  color: #999;
  font-size: 12px;
}
.record-detail {
  padding: 8px 0;
}
.detail-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  margin-bottom: 4px;
}
.detail-item.detail-correct {
  background: #f0fdf4;
}
.detail-item.detail-wrong {
  background: #fef2f2;
}
.detail-index {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  font-size: 11px;
  color: #666;
  margin-right: 10px;
  flex-shrink: 0;
}
.correct-text {
  color: #18a058;
  font-weight: 500;
  font-size: 14px;
}
.wrong-text {
  color: #d03050;
  font-size: 14px;
}
.user-ans {
  text-decoration: line-through;
  opacity: 0.7;
}
.correct-ans {
  font-weight: 600;
  color: #18a058;
}
.detail-meaning {
  color: #999;
  font-size: 12px;
  margin-left: 8px;
}
</style>
