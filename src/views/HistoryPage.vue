<template>
  <div class="history-page">
    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="history" tab="练习记录">
        <div v-if="history.length === 0">
          <n-empty description="暂无练习记录" />
        </div>
        <n-collapse v-else>
          <n-collapse-item
            v-for="record in history"
            :key="record.id"
            :name="record.id"
          >
            <template #header>
              <div class="record-header">
                <n-text strong>{{ record.unitName }} - {{ record.paperName }}</n-text>
                <n-text depth="3" style="margin-left: 12px;">{{ formatDate(record.date) }}</n-text>
              </div>
            </template>
            <template #header-extra>
              <n-tag :type="getTagType(record.score, record.total)" size="small">
                {{ record.score }}/{{ record.total }} ({{ Math.round(record.score / record.total * 100) }}%)
              </n-tag>
            </template>
            <div class="record-detail">
              <div
                v-for="(answer, index) in record.answers"
                :key="index"
                class="detail-item"
              >
                <n-text>{{ index + 1 }}. {{ answer }}</n-text>
                <n-text
                  v-if="getCorrectWord(record, index)"
                  :type="isCorrect(answer, record, index) ? 'success' : 'error'"
                  style="margin-left: 8px;"
                >
                  {{ isCorrect(answer, record, index) ? '✓' : '→ ' + getCorrectWord(record, index) }}
                </n-text>
              </div>
            </div>
          </n-collapse-item>
        </n-collapse>
      </n-tab-pane>

      <n-tab-pane name="wrong-words" tab="错词统计">
        <div v-if="wrongWordsList.length === 0">
          <n-empty description="暂无错词记录" />
        </div>
        <n-data-table
          v-else
          :columns="wrongColumns"
          :data="wrongWordsList"
          :pagination="{ pageSize: 20 }"
        />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import {
  NTabs, NTabPane, NCollapse, NCollapseItem, NText, NTag,
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
</script>

<style scoped>
.history-page {
  max-width: 800px;
  margin: 0 auto;
}
.record-header {
  display: flex;
  align-items: center;
}
.record-detail {
  padding: 8px 0;
}
.detail-item {
  padding: 4px 0;
}
</style>
