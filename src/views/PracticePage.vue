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
          <span class="word-text">{{ userAnswers[index] }}</span>
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
  currentInput.value = word
  finished.value = false
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
</style>
