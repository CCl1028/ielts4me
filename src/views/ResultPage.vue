<template>
  <div class="result-page" v-if="results">
    <div class="score-section">
      <n-statistic label="正确率">
        <template #default>
          <span class="score-number">{{ results.score }} / {{ results.total }}</span>
        </template>
        <template #suffix>
          <n-text :type="percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'error'">
            {{ percentage }}%
          </n-text>
        </template>
      </n-statistic>
      <n-progress
        type="line"
        :percentage="percentage"
        :status="percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'error'"
        style="margin-top: 12px;"
      />
    </div>

    <n-divider />

    <div class="results-list">
      <div
        v-for="(item, index) in results.results"
        :key="index"
        class="result-item"
        :class="{ correct: item.correct, wrong: !item.correct }"
      >
        <span class="result-index">{{ index + 1 }}.</span>
        <span v-if="item.correct" class="result-correct">
          ✓ {{ item.correctAnswer }}
          <span class="meaning">{{ getMeaning(index) }}</span>
        </span>
        <span v-else class="result-wrong">
          ✗ <span class="user-answer">{{ item.userAnswer || '(未作答)' }}</span>
          → <span class="correct-answer">{{ item.correctAnswer }}</span>
          <span class="meaning">{{ getMeaning(index) }}</span>
        </span>
      </div>
    </div>

    <n-divider />

    <div class="actions">
      <n-button @click="$router.push('/')">返回首页</n-button>
      <n-button type="primary" @click="retry">重新练习本试卷</n-button>
    </div>
  </div>

  <div v-else>
    <n-result status="info" title="没有批改数据" description="请先完成一次练习">
      <template #footer>
        <n-button @click="$router.push('/')">返回首页</n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NStatistic, NProgress, NDivider, NButton, NText, NResult } from 'naive-ui'
import { usePracticeStore } from '../stores/practice'

const router = useRouter()
const store = usePracticeStore()
const results = store.results

const percentage = computed(() => {
  if (!results) return 0
  return Math.round((results.score / results.total) * 100)
})

function getMeaning(index) {
  if (store.currentPaper && store.currentPaper.meanings) {
    return store.currentPaper.meanings[index] || ''
  }
  return ''
}

function retry() {
  if (store.currentUnit && store.currentPaper) {
    router.push(`/practice/${store.currentUnit.id}/${store.currentPaper.id}`)
  }
}
</script>

<style scoped>
.result-page {
  max-width: 600px;
  margin: 0 auto;
}
.score-section {
  text-align: center;
  padding: 24px 0;
}
.score-number {
  font-size: 36px;
  font-weight: bold;
}
.results-list {
  max-height: 500px;
  overflow-y: auto;
}
.result-item {
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 4px;
}
.result-item.correct {
  background: #f0fff0;
}
.result-item.wrong {
  background: #fff0f0;
}
.result-index {
  color: #999;
  margin-right: 8px;
}
.result-correct {
  color: #18a058;
}
.result-wrong {
  color: #d03050;
}
.user-answer {
  text-decoration: line-through;
  opacity: 0.7;
}
.correct-answer {
  font-weight: bold;
}
.meaning {
  color: #999;
  font-size: 12px;
  margin-left: 8px;
}
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
