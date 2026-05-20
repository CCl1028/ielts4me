/**
 * 批改单个单词
 * @param {string} userAnswer 用户答案
 * @param {string} correctAnswer 正确答案
 * @returns {boolean}
 */
export function checkWord(userAnswer, correctAnswer) {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
}

// "不会"标记常量
export const SKIP_MARK = '__SKIP__'
// "漏听"标记常量
export const BLANK_MARK = '__BLANK__'

/**
 * 批改整份试卷
 * @param {string[]} userAnswers 用户答案数组
 * @param {string[]} correctAnswers 正确答案数组
 * @returns {{ results: {userAnswer: string, correctAnswer: string, correct: boolean, skipped: boolean, unanswered: boolean}[], score: number, total: number }}
 */
export function checkPaper(userAnswers, correctAnswers) {
  const results = correctAnswers.map((correct, index) => {
    const userAnswer = userAnswers[index] || ''
    const skipped = userAnswer === SKIP_MARK
    const blank = userAnswer === BLANK_MARK
    const unanswered = index >= userAnswers.length

    return {
      userAnswer: skipped ? '不会' : blank ? '(漏听)' : userAnswer,
      correctAnswer: correct,
      correct: !skipped && !blank && !unanswered && checkWord(userAnswer, correct),
      skipped,
      blank,
      unanswered
    }
  })
  // total 只算实际作答的（含"不会"），不算未填的
  const answered = results.filter(r => !r.unanswered)
  const score = answered.filter(r => r.correct).length
  return { results, score, total: answered.length }
}
