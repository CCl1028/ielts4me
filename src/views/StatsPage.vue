<template>
  <div class="stats-page">
    <h2 class="page-title">学习统计</h2>

    <!-- 1. 概览数字卡片 -->
    <div class="overview-cards">
      <div class="stat-card">
        <div class="stat-number">{{ totalPractices }}</div>
        <div class="stat-label">累计练习</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ practiceDays }}</div>
        <div class="stat-label">练习天数</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ avgAccuracy }}%</div>
        <div class="stat-label">平均正确率</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ coveredPapers }} / {{ totalPapers }}</div>
        <div class="stat-label">已覆盖试卷</div>
      </div>
    </div>

    <!-- 6. 最佳/最差成绩 -->
    <div class="best-worst-section" v-if="history.length > 0">
      <div class="bw-card best">
        <div class="bw-icon">🏆</div>
        <div class="bw-info">
          <div class="bw-title">最佳成绩</div>
          <div class="bw-paper">{{ bestRecord.paperName }}</div>
          <div class="bw-detail">{{ bestRecord.accuracy }}% · {{ formatDate(bestRecord.date) }}</div>
        </div>
      </div>
      <div class="bw-card worst">
        <div class="bw-icon">📉</div>
        <div class="bw-info">
          <div class="bw-title">最需提升</div>
          <div class="bw-paper">{{ worstRecord.paperName }}</div>
          <div class="bw-detail">{{ worstRecord.accuracy }}% · {{ formatDate(worstRecord.date) }}</div>
        </div>
      </div>
    </div>

    <!-- 2. 正确率趋势柱状图 -->
    <div class="section">
      <h3 class="section-title">正确率趋势</h3>
      <div v-if="recentPractices.length >= 3" class="bar-chart">
        <div class="bar-chart-inner">
          <div
            v-for="(item, idx) in recentPractices"
            :key="idx"
            class="bar-wrapper"
            @mouseenter="hoveredBar = idx"
            @mouseleave="hoveredBar = -1"
          >
            <div class="bar-tooltip" v-if="hoveredBar === idx">
              {{ item.paperName }}<br>{{ item.accuracy }}%
            </div>
            <div
              class="bar"
              :style="{ height: item.accuracy + '%' }"
              :class="getBarClass(item.accuracy)"
            ></div>
            <div class="bar-label">{{ item.dateShort }}</div>
          </div>
        </div>
        <div class="bar-axis">
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
      </div>
      <div v-else class="empty-hint">
        <n-text depth="3">继续练习，数据积累后这里会展示你的进步曲线 📈</n-text>
      </div>
    </div>

    <!-- 3. 练习热力格 -->
    <div class="section">
      <h3 class="section-title">练习热力图</h3>
      <div class="heatmap-container">
        <div class="heatmap-months">
          <div class="heatmap-months-spacer"></div>
          <div class="heatmap-months-row">
            <span
              v-for="(m, idx) in heatmapMonths"
              :key="idx"
              class="heatmap-month-label"
              :style="{ gridColumn: m.col + ' / span ' + m.span }"
            >{{ m.label }}</span>
          </div>
        </div>
        <div class="heatmap-body">
          <div class="heatmap-weekdays">
            <span>周一</span>
            <span></span>
            <span>周三</span>
            <span></span>
            <span>周五</span>
            <span></span>
            <span>周日</span>
          </div>
          <div class="heatmap-grid">
            <div
              v-for="(day, idx) in heatmapData"
              :key="idx"
              class="heatmap-cell"
              :class="'level-' + day.level"
              :title="day.date + '：' + day.count + '次练习'"
            ></div>
          </div>
        </div>
        <div class="heatmap-legend">
          <span class="legend-label">少</span>
          <div class="heatmap-cell level-0"></div>
          <div class="heatmap-cell level-1"></div>
          <div class="heatmap-cell level-2"></div>
          <div class="heatmap-cell level-3"></div>
          <span class="legend-label">多</span>
        </div>
      </div>
    </div>

    <!-- 4. 章节正确率对比 -->
    <div class="section">
      <h3 class="section-title">章节正确率</h3>
      <div class="chapter-list">
        <div v-for="chapter in chapterStats" :key="chapter.id" class="chapter-group">
          <div class="chapter-row clickable" @click="toggleChapter(chapter.id)">
            <div class="chapter-name">
              <span class="expand-icon">{{ expandedChapters[chapter.id] ? '▾' : '▸' }}</span>
              {{ chapter.name }}
            </div>
            <div class="chapter-bar-wrapper">
              <div class="chapter-bar">
                <div
                  class="chapter-bar-fill"
                  :style="{ width: chapter.accuracy + '%' }"
                  :class="getBarClass(chapter.accuracy)"
                ></div>
              </div>
              <span class="chapter-accuracy" v-if="chapter.practiced">{{ chapter.accuracy }}%</span>
              <span class="chapter-accuracy not-practiced" v-else>未练习</span>
            </div>
            <div class="chapter-count">{{ chapter.practiced ? chapter.count + '次' : '' }}</div>
          </div>
          <!-- 试卷细分 -->
          <div v-if="expandedChapters[chapter.id]" class="paper-list">
            <div v-for="paper in chapter.papers" :key="paper.id" class="paper-row">
              <div class="paper-name">{{ paper.name }}</div>
              <div class="paper-bar-wrapper">
                <div class="paper-bar">
                  <div
                    class="chapter-bar-fill"
                    :style="{ width: paper.accuracy + '%' }"
                    :class="getBarClass(paper.accuracy)"
                  ></div>
                </div>
                <span class="paper-accuracy" v-if="paper.practiced">{{ paper.accuracy }}%</span>
                <span class="paper-accuracy not-practiced" v-else>未练习</span>
              </div>
              <div class="paper-count" v-if="paper.practiced">{{ paper.count }}次</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. 高频错词 TOP 10 -->
    <div class="section">
      <h3 class="section-title">高频错词 TOP 10</h3>
      <div v-if="topWrongWords.length > 0" class="wrong-words-list">
        <div v-for="(item, idx) in topWrongWords" :key="idx" class="wrong-word-row">
          <span class="wrong-word-rank">#{{ idx + 1 }}</span>
          <span class="wrong-word-text">{{ item.word }}</span>
          <div class="wrong-word-bar-wrapper">
            <div
              class="wrong-word-bar"
              :style="{ width: (item.count / maxWrongCount * 100) + '%' }"
              :class="getWrongBarClass(item.count)"
            ></div>
          </div>
          <span class="wrong-word-count">{{ item.count }}次</span>
          <span class="wrong-word-date">{{ item.lastDate }}</span>
        </div>
      </div>
      <div v-else class="empty-hint">
        <n-text depth="3">还没有错词记录，继续保持！✨</n-text>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onActivated, onMounted, onUnmounted } from 'vue'
import { NText } from 'naive-ui'
import { getHistory, getWrongWords } from '../utils/storage'
import corpus from '../data/corpus.json'

const history = ref([])
const wrongWords = ref({})
const hoveredBar = ref(-1)

function refreshData() {
  history.value = getHistory()
  wrongWords.value = getWrongWords()
}

onMounted(() => {
  refreshData()
  // 监听页面可见性变化（从其他页面切回来时刷新）
  document.addEventListener('visibilitychange', onVisible)
  // 监听 localStorage 变化
  window.addEventListener('storage', refreshData)
  // 监听自定义事件（同标签页内 localStorage 变化）
  window.addEventListener('practice-updated', refreshData)
})

onActivated(refreshData)

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisible)
  window.removeEventListener('storage', refreshData)
  window.removeEventListener('practice-updated', refreshData)
})

function onVisible() {
  if (document.visibilityState === 'visible') {
    refreshData()
  }
}

// 总试卷数
const totalPapers = computed(() => {
  return corpus.units.reduce((sum, u) => sum + u.papers.length, 0)
})

// 1. 概览数据
const totalPractices = computed(() => history.value.length)

const practiceDays = computed(() => {
  const days = new Set(history.value.map(r => r.date.slice(0, 10)))
  return days.size
})

const avgAccuracy = computed(() => {
  if (history.value.length === 0) return 0
  const sum = history.value.reduce((acc, r) => acc + Math.round((r.score / r.total) * 100), 0)
  return Math.round(sum / history.value.length)
})

const coveredPapers = computed(() => {
  const ids = new Set(history.value.map(r => r.paperId))
  return ids.size
})

// 2. 正确率趋势（最近15次，按时间正序）
const recentPractices = computed(() => {
  const sorted = [...history.value].reverse().slice(-15)
  return sorted.map(r => ({
    paperName: r.paperName,
    accuracy: Math.round((r.score / r.total) * 100),
    dateShort: r.date.slice(5, 10),
    date: r.date
  }))
})

// 3. 热力图数据
function toLocalDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const heatmapData = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = []

  // 从今天往回推，找到今天所在周的周日，再往前推23周的周一
  const todayDay = today.getDay() // 0=周日
  const daysToSunday = todayDay === 0 ? 0 : 7 - todayDay
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + daysToSunday) // 本周日

  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - 24 * 7 + 1) // 24周前的周一

  // 统计每天的练习次数（将 ISO 日期转为本地日期）
  const countMap = {}
  history.value.forEach(r => {
    const d = toLocalDateStr(new Date(r.date))
    countMap[d] = (countMap[d] || 0) + 1
  })

  // 生成格子，按列优先（周一到周日）
  for (let col = 0; col < 24; col++) {
    for (let row = 0; row < 7; row++) {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + col * 7 + row)
      const dateStr = toLocalDateStr(d)
      const count = countMap[dateStr] || 0
      let level = 0
      if (count >= 3) level = 3
      else if (count >= 2) level = 2
      else if (count >= 1) level = 1
      // 未来日期不显示
      const isFuture = d > today
      days.push({ date: dateStr, count, level: isFuture ? -1 : level })
    }
  }
  return days
})

// 3b. 热力图月份标签
const heatmapMonths = computed(() => {
  if (heatmapData.value.length === 0) return []
  const months = []
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  let currentMonth = -1
  let startCol = 0

  for (let col = 0; col < 24; col++) {
    const cellIndex = col * 7 // 每列第一个格子
    const day = heatmapData.value[cellIndex]
    if (!day) continue
    const month = parseInt(day.date.slice(5, 7)) - 1
    if (month !== currentMonth) {
      if (currentMonth !== -1) {
        months.push({ label: monthNames[currentMonth], col: startCol + 1, span: col - startCol })
      }
      currentMonth = month
      startCol = col
    }
  }
  // 最后一个月
  if (currentMonth !== -1) {
    months.push({ label: monthNames[currentMonth], col: startCol + 1, span: 24 - startCol })
  }
  return months
})

// 4. 章节正确率
const expandedChapters = ref({})

function toggleChapter(id) {
  expandedChapters.value[id] = !expandedChapters.value[id]
}

const chapterStats = computed(() => {
  const stats = corpus.units.map(unit => {
    const records = history.value.filter(r => r.unitId === unit.id)
    const practiced = records.length > 0
    const accuracy = practiced
      ? Math.round(records.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / records.length)
      : 0

    // 每个试卷的细分数据
    const papers = unit.papers.map(paper => {
      const paperRecords = history.value.filter(r => r.paperId === paper.id)
      const paperPracticed = paperRecords.length > 0
      const paperAccuracy = paperPracticed
        ? Math.round(paperRecords.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / paperRecords.length)
        : 0
      return {
        id: paper.id,
        name: paper.name,
        practiced: paperPracticed,
        accuracy: paperAccuracy,
        count: paperRecords.length
      }
    })

    return {
      id: unit.id,
      name: unit.name,
      practiced,
      accuracy,
      count: records.length,
      papers
    }
  })
  // 按正确率从低到高排，未练习的放最后
  return stats.sort((a, b) => {
    if (!a.practiced && !b.practiced) return 0
    if (!a.practiced) return 1
    if (!b.practiced) return -1
    return a.accuracy - b.accuracy
  })
})

// 5. 高频错词 TOP 10
const topWrongWords = computed(() => {
  const words = wrongWords.value
  const list = Object.entries(words).map(([word, info]) => ({
    word,
    count: info.count,
    lastDate: info.lastDate
  }))
  list.sort((a, b) => b.count - a.count)
  return list.slice(0, 10)
})

const maxWrongCount = computed(() => {
  if (topWrongWords.value.length === 0) return 1
  return topWrongWords.value[0].count
})

// 6. 最佳/最差成绩
const bestRecord = computed(() => {
  if (history.value.length === 0) return {}
  let best = history.value[0]
  history.value.forEach(r => {
    if ((r.score / r.total) > (best.score / best.total)) best = r
  })
  return { ...best, accuracy: Math.round((best.score / best.total) * 100) }
})

const worstRecord = computed(() => {
  if (history.value.length === 0) return {}
  let worst = history.value[0]
  history.value.forEach(r => {
    if ((r.score / r.total) < (worst.score / worst.total)) worst = r
  })
  return { ...worst, accuracy: Math.round((worst.score / worst.total) * 100) }
})

// 工具方法
function getBarClass(accuracy) {
  if (accuracy >= 80) return 'bar-green'
  if (accuracy >= 60) return 'bar-yellow'
  return 'bar-red'
}

function getWrongBarClass(count) {
  if (count >= 6) return 'wrong-bar-high'
  if (count >= 3) return 'wrong-bar-mid'
  return 'wrong-bar-low'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}
</script>

<style scoped>
.stats-page {
  color: #333;
}
.page-title {
  color: #fff;
  text-align: center;
  margin-bottom: 24px;
  font-size: 22px;
}

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}
.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px 12px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.stat-number {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.stat-label {
  font-size: 13px;
  color: #888;
  margin-top: 6px;
}

/* 最佳/最差 */
.best-worst-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}
.bw-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.bw-icon {
  font-size: 32px;
}
.bw-title {
  font-size: 12px;
  color: #888;
}
.bw-paper {
  font-size: 14px;
  font-weight: 600;
  margin: 2px 0;
}
.bw-detail {
  font-size: 12px;
  color: #666;
}

/* 通用 section */
.section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
}

/* 柱状图 */
.bar-chart {
  position: relative;
}
.bar-chart-inner {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 160px;
  padding: 0 4px;
  border-bottom: 1px solid #eee;
}
.bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  position: relative;
  cursor: pointer;
}
.bar {
  width: 100%;
  max-width: 32px;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}
.bar-green { background: linear-gradient(180deg, #52c41a, #73d13d); }
.bar-yellow { background: linear-gradient(180deg, #faad14, #ffc53d); }
.bar-red { background: linear-gradient(180deg, #ff4d4f, #ff7875); }
.bar-label {
  font-size: 10px;
  color: #999;
  margin-top: 4px;
}
.bar-tooltip {
  position: absolute;
  top: -40px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 10;
  line-height: 1.4;
}
.bar-axis {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #ccc;
  margin-top: 4px;
}

/* 热力图 */
.heatmap-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-x: auto;
}
.heatmap-months {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}
.heatmap-months-spacer {
  width: 28px;
  flex-shrink: 0;
}
.heatmap-months-row {
  display: grid;
  grid-template-columns: repeat(24, 14px);
  gap: 3px;
}
.heatmap-month-label {
  font-size: 11px;
  color: #888;
  white-space: nowrap;
}
.heatmap-body {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.heatmap-weekdays {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 11px;
  color: #999;
  text-align: right;
  width: 28px;
  flex-shrink: 0;
}
.heatmap-weekdays span {
  height: 14px;
  line-height: 14px;
}
.heatmap-grid {
  display: grid;
  grid-template-rows: repeat(7, 14px);
  grid-template-columns: repeat(24, 14px);
  grid-auto-flow: column;
  gap: 3px;
}
.heatmap-cell {
  width: 14px;
  height: 14px;
  border-radius: 2px;
}
.heatmap-cell.level-0 { background: #ebedf0; }
.heatmap-cell.level-1 { background: #c6b4f0; }
.heatmap-cell.level-2 { background: #8b5cf6; }
.heatmap-cell.level-3 { background: #5b21b6; }
.heatmap-cell.level--1 { background: transparent; }
.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  justify-content: flex-end;
}
.heatmap-legend .heatmap-cell {
  width: 12px;
  height: 12px;
}
.legend-label {
  font-size: 10px;
  color: #999;
}

/* 章节对比 */
.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.chapter-group {
  border-radius: 8px;
}
.chapter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}
.chapter-row.clickable {
  cursor: pointer;
  border-radius: 8px;
  padding: 8px;
  margin: 0 -8px;
  transition: background 0.2s;
}
.chapter-row.clickable:hover {
  background: #f8f6ff;
}
.expand-icon {
  font-size: 10px;
  color: #999;
  margin-right: 4px;
}
.chapter-name {
  width: 130px;
  font-size: 13px;
  font-weight: 500;
  flex-shrink: 0;
}
.paper-list {
  padding-left: 20px;
  border-left: 2px solid #f0eaff;
  margin-left: 12px;
  margin-bottom: 8px;
}
.paper-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 5px 0;
}
.paper-name {
  width: 140px;
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.paper-bar-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 60%;
}
.paper-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}
.paper-bar .chapter-bar-fill {
  border-radius: 4px;
}
.paper-accuracy {
  font-size: 12px;
  font-weight: 600;
  width: 45px;
  text-align: right;
}
.paper-accuracy.not-practiced {
  color: #ccc;
  font-weight: 400;
}
.paper-count {
  font-size: 11px;
  color: #999;
  width: 36px;
}
.chapter-bar-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.chapter-bar {
  flex: 1;
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}
.chapter-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.4s;
}
.chapter-bar-fill.bar-green { background: linear-gradient(90deg, #52c41a, #73d13d); }
.chapter-bar-fill.bar-yellow { background: linear-gradient(90deg, #faad14, #ffc53d); }
.chapter-bar-fill.bar-red { background: linear-gradient(90deg, #ff4d4f, #ff7875); }
.chapter-accuracy {
  font-size: 13px;
  font-weight: 600;
  width: 50px;
  text-align: right;
}
.chapter-accuracy.not-practiced {
  color: #ccc;
  font-weight: 400;
}
.chapter-count {
  font-size: 12px;
  color: #999;
  width: 40px;
}

/* 错词 */
.wrong-words-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.wrong-word-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.wrong-word-rank {
  font-size: 12px;
  color: #999;
  width: 24px;
}
.wrong-word-text {
  font-size: 14px;
  font-weight: 500;
  width: 120px;
  flex-shrink: 0;
}
.wrong-word-bar-wrapper {
  flex: 1;
  height: 10px;
  background: #f5f5f5;
  border-radius: 5px;
  overflow: hidden;
}
.wrong-word-bar {
  height: 100%;
  border-radius: 5px;
  transition: width 0.4s;
}
.wrong-bar-low { background: #ffccc7; }
.wrong-bar-mid { background: #ff7875; }
.wrong-bar-high { background: #cf1322; }
.wrong-word-count {
  font-size: 12px;
  color: #666;
  width: 36px;
  text-align: right;
}
.wrong-word-date {
  font-size: 11px;
  color: #bbb;
  width: 80px;
  text-align: right;
}

/* 空状态 */
.empty-hint {
  text-align: center;
  padding: 32px 0;
}

/* 响应式 */
@media (max-width: 640px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .best-worst-section {
    grid-template-columns: 1fr;
  }
  .stat-number {
    font-size: 22px;
  }
  .chapter-name {
    width: 80px;
    font-size: 12px;
  }
  .wrong-word-text {
    width: 80px;
  }
}
</style>
