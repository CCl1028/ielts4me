const HISTORY_KEY = 'practice-history'
const WRONG_WORDS_KEY = 'wrong-words'

export function getHistory() {
  const raw = localStorage.getItem(HISTORY_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveHistory(record) {
  const history = getHistory()
  history.unshift(record)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function getWrongWords() {
  const raw = localStorage.getItem(WRONG_WORDS_KEY)
  return raw ? JSON.parse(raw) : {}
}

export function updateWrongWords(wrongList) {
  const words = getWrongWords()
  const today = new Date().toISOString().slice(0, 10)
  wrongList.forEach(word => {
    if (words[word]) {
      words[word].count++
      words[word].lastDate = today
    } else {
      words[word] = { count: 1, lastDate: today }
    }
  })
  localStorage.setItem(WRONG_WORDS_KEY, JSON.stringify(words))
}

export function clearAllData() {
  localStorage.removeItem(HISTORY_KEY)
  localStorage.removeItem(WRONG_WORDS_KEY)
}
