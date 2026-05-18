/**
 * 批改单个单词
 * @param {string} userAnswer 用户答案
 * @param {string} correctAnswer 正确答案
 * @returns {boolean}
 */
export function checkWord(userAnswer, correctAnswer) {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
}

/**
 * 批改整份试卷
 * @param {string[]} userAnswers 用户答案数组
 * @param {string[]} correctAnswers 正确答案数组
 * @returns {{ results: {userAnswer: string, correctAnswer: string, correct: boolean}[], score: number, total: number }}
 */
export function checkPaper(userAnswers, correctAnswers) {
  const results = correctAnswers.map((correct, index) => {
    const userAnswer = userAnswers[index] || ''
    return {
      userAnswer,
      correctAnswer: correct,
      correct: checkWord(userAnswer, correct)
    }
  })
  const score = results.filter(r => r.correct).length
  return { results, score, total: correctAnswers.length }
}
