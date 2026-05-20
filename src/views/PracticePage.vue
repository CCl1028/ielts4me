<template>
  <div class="practice-page" v-if="paper">
    <div class="practice-card">
      <div class="practice-header">
        <div class="header-info">
          <n-text strong style="font-size: 16px;">{{ store.currentUnit?.name }}</n-text>
          <n-text depth="3" style="font-size: 14px; margin-top: 4px; display: block;">{{ paper.name }}</n-text>
        </div>
        <div v-if="!finished" class="progress-badge">
          <span class="progress-current">{{ userAnswers.length }}</span>
          <span class="progress-sep">/</span>
          <span class="progress-total">{{ paper.words.length }}</span>
        </div>
        <div v-else class="progress-badge done">
          完成!
        </div>
      </div>

      <div class="input-section" v-if="!finished">
        <n-input
          ref="inputRef"
          v-model:value="currentInput"
          placeholder="输入听到的单词，按回车确认 ↵"
          size="large"
          :autofocus="true"
          @keyup.enter="handleEnter"
          class="word-input"
        />
        <div class="input-actions">
          <n-button
            size="small"
            quaternary
            type="warning"
            :disabled="userAnswers.length === 0"
            @click="handleUndo"
          >
            ← 撤回上一个
          </n-button>
          <n-button
            size="small"
            quaternary
            type="error"
            @click="handleSkip"
          >
            不会，跳过
          </n-button>
          <n-button
            size="small"
            quaternary
            type="info"
            :disabled="userAnswers.length === 0"
            @click="handleSubmit"
          >
            提前提交
          </n-button>
        </div>
      </div>

      <div class="submit-section" v-else>
        <n-button type="primary" size="large" @click="handleSubmit" class="submit-btn">
          提交批改
        </n-button>
      </div>

      <div class="card-footer">
        <span></span>
        <span class="history-link" @click="showHistoryModal = true">历史记录 →</span>
      </div>
    </div>

    <div class="word-list-card" v-if="userAnswers.length > 0">
      <div class="word-list-header">
        <n-text depth="3">已输入 {{ userAnswers.length }} 个词</n-text>
      </div>
      <div class="word-list">
        <div
          v-for="index in reversedIndices"
          :key="index"
          class="word-item"
          @click="handleEdit(index)"
        >
          <span class="word-index">{{ index + 1 }}</span>
          <span class="word-text" :class="{ 'word-skipped': userAnswers[index] === SKIP_MARK }">{{ userAnswers[index] === SKIP_MARK ? '不会' : userAnswers[index] }}</span>
          <span class="word-edit-hint">点击修改</span>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <n-modal v-model:show="showEditModal" preset="dialog" title="修改答案">
      <n-input v-model:value="editValue" placeholder="修改答案" @keyup.enter="confirmEdit" />
      <template #action>
        <n-button @click="showEditModal = false">取消</n-button>
        <n-button type="primary" @click="confirmEdit">确认</n-button>
      </template>
    </n-modal>

    <!-- 提交确认 -->
    <n-modal v-model:show="showConfirmModal" preset="dialog" title="确认提交">
      <n-text>确定要提交批改吗？共输入 {{ userAnswers.length }} / {{ paper.words.length }} 个词。</n-text>
      <template #action>
        <n-button @click="showConfirmModal = false">取消</n-button>
        <n-button type="primary" @click="doSubmit">确认提交</n-button>
      </template>
    </n-modal>

    <!-- 历史记录弹窗 -->
    <n-modal v-model:show="showHistoryModal" preset="card" title="本节历史记录" style="width: 90%; max-width: 500px;">
      <div v-if="paperHistory.length === 0" style="text-align: center; padding: 20px; color: #999;">
        暂无历史记录
      </div>
      <div v-else>
        <div
          v-for="record in paperHistory"
          :key="record.id"
          class="history-item"
          @click="viewHistoryDetail(record)"
        >
          <div class="history-item-info">
            <span class="history-date">{{ formatDate(record.date) }}</span>
          </div>
          <span class="history-score" :class="getScoreClass(record)">
            {{ record.score }}/{{ record.total }} ({{ Math.round(record.score / record.total * 100) }}%)
          </span>
        </div>
      </div>
    </n-modal>

    <!-- 历史详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="答题详情" style="width: 90%; max-width: 500px; max-height: 80vh;">
      <div v-if="selectedRecord" class="detail-list">
        <div
          v-for="(answer, index) in selectedRecord.answers"
          :key="index"
          class="detail-row"
          :class="{ 'detail-correct': isAnswerCorrect(answer, index), 'detail-wrong': !isAnswerCorrect(answer, index) }"
        >
          <span class="detail-idx">{{ index + 1 }}</span>
          <span v-if="isAnswerCorrect(answer, index)" class="detail-correct-text">✓ {{ answer }}</span>
          <span v-else class="detail-wrong-text">
            ✗ <span class="detail-user">{{ answer || '(未作答)' }}</span> → <span class="detail-right">{{ paper.words[index] }}</span>
          </span>
          <span class="detail-meaning">{{ paper.meanings ? paper.meanings[index] : '' }}</span>
        </div>
      </div>
    </n-modal>
  </div>

  <div v-else class="error-card">
    <n-result status="error" title="未找到试卷" description="请返回首页选择试卷">
      <template #footer>
        <n-button @click="$router.push('/')">返回首页</n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NInput, NButton, NText, NModal, NResult
} from 'naive-ui'
import { usePracticeStore } from '../stores/practice'
import { SKIP_MARK } from '../utils/checker'
import { getHistory } from '../utils/storage'

const route = useRoute()
const router = useRouter()
const store = usePracticeStore()

const { unitId, paperId } = route.params
store.startPractice(unitId, paperId)

const paper = store.currentPaper
const userAnswers = store.userAnswers

const currentInput = ref('')
const inputRef = ref(null)
const finished = ref(false)

const reversedIndices = computed(() => {
  const indices = []
  for (let i = userAnswers.length - 1; i >= 0; i--) {
    indices.push(i)
  }
  return indices
})

const showEditModal = ref(false)
const editIndex = ref(-1)
const editValue = ref('')

const showConfirmModal = ref(false)
const showHistoryModal = ref(false)
const showDetailModal = ref(false)
const selectedRecord = ref(null)

const paperHistory = computed(() => {
  return getHistory().filter(r => r.paperId === paperId)
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getScoreClass(record) {
  const p = record.score / record.total
  if (p >= 0.8) return 'score-good'
  if (p >= 0.6) return 'score-ok'
  return 'score-bad'
}

function viewHistoryDetail(record) {
  selectedRecord.value = record
  showDetailModal.value = true
}

function isAnswerCorrect(answer, index) {
  if (!paper || !paper.words[index]) return false
  return answer.trim().toLowerCase() === paper.words[index].trim().toLowerCase()
}

function handleEnter() {
  if (!currentInput.value.trim()) return
  store.submitAnswer(currentInput.value.trim())
  currentInput.value = ''

  if (userAnswers.length >= paper.words.length) {
    finished.value = true
  }

  nextTick(() => {
    inputRef.value?.focus()
  })
}

function handleUndo() {
  const word = store.undoLast()
  if (word === SKIP_MARK) {
    currentInput.value = ''
  } else {
    currentInput.value = word
  }
  finished.value = false
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function handleSkip() {
  store.submitAnswer(SKIP_MARK)
  currentInput.value = ''

  if (userAnswers.length >= paper.words.length) {
    finished.value = true
  }

  nextTick(() => {
    inputRef.value?.focus()
  })
}

function handleEdit(index) {
  editIndex.value = index
  editValue.value = userAnswers[index]
  showEditModal.value = true
}

function confirmEdit() {
  if (editValue.value.trim()) {
    store.updateAnswer(editIndex.value, editValue.value.trim())
  }
  showEditModal.value = false
}

function handleSubmit() {
  showConfirmModal.value = true
}

function doSubmit() {
  showConfirmModal.value = false
  store.submitPaper()
  router.push('/result')
}

onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus()
  })
})
</script>

<style scoped>
.practice-page {
  max-width: 600px;
  margin: 0 auto;
}
.practice-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
.practice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.progress-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
.progress-badge.done {
  background: linear-gradient(135deg, #18a058, #36d399);
  box-shadow: 0 4px 12px rgba(24, 160, 88, 0.3);
}
.progress-current {
  font-size: 20px;
}
.progress-sep {
  margin: 0 2px;
  opacity: 0.7;
}
.progress-total {
  opacity: 0.8;
}
.input-section {
  margin-bottom: 8px;
}
.word-input :deep(.n-input__input-el) {
  font-size: 18px !important;
  letter-spacing: 0.5px;
}
.input-actions {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
}
.input-actions :deep(.n-button) {
  font-weight: 600;
  color: #4a3a8a !important;
}
.submit-section {
  text-align: center;
  padding: 16px 0;
}
.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 12px;
}
.word-list-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px 20px;
  margin-top: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.word-list-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}
.word-list {
  max-height: 300px;
  overflow-y: auto;
}
.word-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 4px;
}
.word-item:hover {
  background: #f5f7ff;
}
.word-item:hover .word-edit-hint {
  opacity: 1;
}
.word-index {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2ff;
  color: #667eea;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
}
.word-text {
  flex: 1;
  font-size: 15px;
  color: #333;
}
.word-skipped {
  color: #ff4d4f;
  font-style: italic;
}
.word-edit-hint {
  font-size: 11px;
  color: #999;
  opacity: 0;
  transition: opacity 0.2s;
}
.error-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
.history-link {
  font-size: 13px;
  color: #667eea;
  cursor: pointer;
  font-weight: 500;
}
.history-link:hover {
  text-decoration: underline;
}
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 6px;
  background: #f9fafb;
}
.history-item:hover {
  background: #f0f2ff;
}
.history-date {
  font-size: 13px;
  color: #666;
}
.history-score {
  font-size: 13px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 10px;
}
.score-good { background: #f0fdf4; color: #18a058; }
.score-ok { background: #fffbeb; color: #d97706; }
.score-bad { background: #fef2f2; color: #d03050; }
.detail-list {
  max-height: 60vh;
  overflow-y: auto;
}
.detail-row {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 4px;
}
.detail-row.detail-correct { background: #f0fdf4; }
.detail-row.detail-wrong { background: #fef2f2; }
.detail-idx {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0,0,0,0.05);
  font-size: 11px;
  color: #666;
  margin-right: 10px;
  flex-shrink: 0;
}
.detail-correct-text { color: #18a058; font-size: 14px; }
.detail-wrong-text { color: #d03050; font-size: 14px; }
.detail-user { text-decoration: line-through; opacity: 0.7; }
.detail-right { font-weight: 600; color: #18a058; }
.detail-meaning { color: #999; font-size: 12px; margin-left: 8px; }
</style>
