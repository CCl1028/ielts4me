<template>
  <div class="result-page" v-if="results">
    <div class="result-card">
      <div class="score-section">
        <div class="score-circle" :class="scoreClass">
          <span class="score-percent">{{ percentage }}%</span>
          <span class="score-detail">{{ results.score }} / {{ results.total }}</span>
        </div>
        <p class="score-message">{{ scoreMessage }}</p>
      </div>

      <div class="results-list">
        <div
          v-for="(item, index) in results.results"
          :key="index"
          class="result-item"
          :class="{ correct: item.correct, wrong: !item.correct && !item.unanswered, unanswered: item.unanswered }"
        >
          <span class="result-index">{{ index + 1 }}</span>
          <div class="result-content">
            <span v-if="item.correct" class="result-correct">
              {{ item.correctAnswer }}
            </span>
            <span v-else-if="item.unanswered" class="result-unanswered">
              <span class="unanswered-label">(未作答)</span>
              <span class="correct-answer">{{ item.correctAnswer }}</span>
            </span>
            <span v-else class="result-wrong">
              <span class="user-answer">{{ item.userAnswer }}</span>
              <span class="arrow">→</span>
              <span class="correct-answer">{{ item.correctAnswer }}</span>
            </span>
            <span class="meaning">{{ getMeaning(index) }}</span>
          </div>
          <span class="result-icon">{{ item.correct ? '✓' : item.unanswered ? '-' : '✗' }}</span>
        </div>
      </div>

      <div class="actions">
        <n-button size="large" @click="$router.push('/')" class="action-btn">返回首页</n-button>
        <n-button type="primary" size="large" @click="retry" class="action-btn">再练一次</n-button>
      </div>
    </div>
  </div>

  <div v-else class="error-card">
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
import { NButton, NResult } from 'naive-ui'
import { usePracticeStore } from '../stores/practice'

const router = useRouter()
const store = usePracticeStore()
const results = store.results

const percentage = computed(() => {
  if (!results) return 0
  return Math.round((results.score / results.total) * 100)
})

const scoreClass = computed(() => {
  if (percentage.value >= 80) return 'excellent'
  if (percentage.value >= 60) return 'good'
  return 'poor'
})

const scoreMessage = computed(() => {
  if (percentage.value >= 90) return '太棒了！继续保持！'
  if (percentage.value >= 80) return '很不错，再接再厉！'
  if (percentage.value >= 60) return '还可以，继续加油！'
  return '需要多加练习哦！'
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
.result-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
.score-section {
  text-align: center;
  padding: 24px 0 32px;
}
.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
.score-circle.excellent {
  background: linear-gradient(135deg, #18a058, #36d399);
}
.score-circle.good {
  background: linear-gradient(135deg, #f0a020, #ffd666);
}
.score-circle.poor {
  background: linear-gradient(135deg, #d03050, #ff6b6b);
}
.score-percent {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}
.score-detail {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 2px;
}
.score-message {
  color: #666;
  font-size: 15px;
  margin: 0;
}
.results-list {
  margin-bottom: 24px;
}
.result-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 6px;
  transition: background 0.2s;
}
.result-item.correct {
  background: #f0fdf4;
}
.result-item.wrong {
  background: #fef2f2;
}
.result-item.unanswered {
  background: #f5f5f5;
}
.result-unanswered {
  display: flex;
  align-items: center;
  gap: 6px;
}
.unanswered-label {
  color: #bbb;
  font-style: italic;
}
.result-item.unanswered .result-icon {
  color: #ccc;
}
.result-index {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.05);
  color: #666;
}
.result-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
.result-correct {
  color: #18a058;
  font-weight: 500;
}
.result-wrong {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.user-answer {
  text-decoration: line-through;
  color: #d03050;
  opacity: 0.7;
}
.arrow {
  color: #999;
  font-size: 12px;
}
.correct-answer {
  font-weight: 600;
  color: #18a058;
}
.meaning {
  color: #999;
  font-size: 12px;
  margin-left: 4px;
}
.result-icon {
  font-size: 16px;
  margin-left: 8px;
  flex-shrink: 0;
}
.result-item.correct .result-icon {
  color: #18a058;
}
.result-item.wrong .result-icon {
  color: #d03050;
}
.actions {
  display: flex;
  gap: 12px;
}
.action-btn {
  flex: 1;
  border-radius: 12px;
  height: 44px;
}
.error-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
</style>
