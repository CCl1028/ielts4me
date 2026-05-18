<template>
  <div class="practice-page" v-if="paper">
    <div class="practice-header">
      <n-text strong>{{ store.currentUnit?.name }} - {{ paper.name }}</n-text>
      <n-text v-if="!finished" type="info" style="font-size: 20px; margin-left: 16px;">
        {{ userAnswers.length + 1 }} / {{ paper.words.length }}
      </n-text>
    </div>

    <div class="input-area" v-if="!finished">
      <n-input
        ref="inputRef"
        v-model:value="currentInput"
        placeholder="输入听到的单词，按回车确认"
        size="large"
        :autofocus="true"
        @keyup.enter="handleEnter"
      />
      <div class="input-actions">
        <n-button
          size="small"
          quaternary
          :disabled="userAnswers.length === 0"
          @click="handleUndo"
        >
          撤回上一个
        </n-button>
      </div>
    </div>

    <div class="input-area" v-else>
      <n-button type="primary" size="large" @click="handleSubmit">
        提交批改
      </n-button>
    </div>

    <n-divider />

    <div class="word-list">
      <n-text depth="3" style="margin-bottom: 8px; display: block;">已输入：</n-text>
      <div
        v-for="index in reversedIndices"
        :key="index"
        class="word-item"
        @click="handleEdit(index)"
      >
        <n-tag :bordered="false" size="medium">
          {{ index + 1 }}. {{ userAnswers[index] }}
        </n-tag>
      </div>
      <n-text v-if="userAnswers.length === 0" depth="3">暂无输入</n-text>
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

  <div v-else>
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
  NInput, NButton, NText, NDivider, NTag, NModal, NResult
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
.practice-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.input-area {
  margin-bottom: 16px;
}
.input-actions {
  margin-top: 8px;
}
.word-list {
  max-height: 400px;
  overflow-y: auto;
}
.word-item {
  margin-bottom: 4px;
  cursor: pointer;
}
.word-item:hover {
  opacity: 0.7;
}
</style>
