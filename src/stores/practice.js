import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import corpus from '../data/corpus.json'
import { checkPaper } from '../utils/checker'
import { saveHistory, updateWrongWords } from '../utils/storage'

export const usePracticeStore = defineStore('practice', () => {
  const currentUnit = ref(null)
  const currentPaper = ref(null)
  const userAnswers = ref([])
  const results = ref(null)

  function getUnits() {
    return corpus.units
  }

  function getPapers(unitId) {
    const unit = corpus.units.find(u => u.id === unitId)
    return unit ? unit.papers : []
  }

  function getPaper(unitId, paperId) {
    const unit = corpus.units.find(u => u.id === unitId)
    if (!unit) return null
    return unit.papers.find(p => p.id === paperId) || null
  }

  function startPractice(unitId, paperId) {
    currentUnit.value = corpus.units.find(u => u.id === unitId)
    currentPaper.value = getPaper(unitId, paperId)
    userAnswers.value = []
    results.value = null
  }

  function submitAnswer(word) {
    userAnswers.value.push(word)
  }

  function updateAnswer(index, word) {
    userAnswers.value[index] = word
  }

  function undoLast() {
    if (userAnswers.value.length > 0) {
      return userAnswers.value.pop()
    }
    return ''
  }

  function submitPaper() {
    if (!currentPaper.value) return null
    const checked = checkPaper(userAnswers.value, currentPaper.value.words)
    results.value = checked

    // 保存历史记录
    const record = {
      id: uuidv4(),
      date: new Date().toISOString(),
      unitId: currentUnit.value.id,
      unitName: currentUnit.value.name,
      paperId: currentPaper.value.id,
      paperName: currentPaper.value.name,
      answers: [...userAnswers.value],
      score: checked.score,
      total: checked.total
    }
    saveHistory(record)

    // 更新错词统计
    const wrongWords = checked.results
      .filter(r => !r.correct)
      .map(r => r.correctAnswer)
    if (wrongWords.length > 0) {
      updateWrongWords(wrongWords)
    }

    return checked
  }

  return {
    currentUnit,
    currentPaper,
    userAnswers,
    results,
    getUnits,
    getPapers,
    getPaper,
    startPractice,
    submitAnswer,
    updateAnswer,
    undoLast,
    submitPaper
  }
})
