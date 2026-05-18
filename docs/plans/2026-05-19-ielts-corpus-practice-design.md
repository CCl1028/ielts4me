# 雅思王听力真题语料库 - 练习应用设计文档

## 概述

一个配合《雅思王听力真题语料库》王陆的听写练习 Web 应用。用户选择 test paper，外部播放音频，在应用中逐词输入，完成后批改并存入历史。

## 技术栈

- Vue 3 + Vite
- Naive UI（轻量 UI 库）
- Pinia（状态管理）
- Vue Router（路由）
- localStorage（数据持久化）

## 页面结构

### 1. 首页（HomePage）
- 顶部/左侧选择单元（第3、4、5、11章）
- 展示该单元下所有 test paper 卡片
- 点击 test paper 进入练习

### 2. 练习页（PracticePage）
- 顶部显示进度（如 "12 / 50"）
- 中间输入框，回车确认跳下一个
- 下方滚动展示已输入单词列表（灰色，不揭晓对错）
- 支持点击已输入的词进行修改，或"撤回上一个"按钮
- 最后一个词回车后弹出确认提交对话框

### 3. 批改结果页（ResultPage）
- 顶部大字显示正确率（如 "42/50 84%"）
- 逐词列表：正确绿色 ✓，错误红色 ✗ 并展示"你的答案 → 正确答案"
- 底部按钮："返回首页" / "重新练习本 paper"

### 4. 历史记录页（HistoryPage）
- 按时间倒序展示记录卡片（日期、单元名、paper名、正确率进度条）
- 点击展开查看详细逐词对比
- "错词统计" Tab：按错误次数降序展示词汇（词 + 错误次数 + 最近错误日期）

## 数据结构

### 语料数据（src/data/corpus.json）

```json
{
  "units": [
    {
      "id": "unit3",
      "name": "第3章",
      "papers": [
        {
          "id": "unit3-paper1",
          "name": "Test Paper 1",
          "words": ["environment", "government", "psychology"]
        }
      ]
    }
  ]
}
```

### localStorage: practice-history

```json
[
  {
    "id": "uuid",
    "date": "2026-05-18T23:50:00",
    "unitId": "unit3",
    "paperId": "unit3-paper1",
    "answers": ["enviroment", "government"],
    "score": 42,
    "total": 50
  }
]
```

### localStorage: wrong-words

```json
{
  "environment": { "count": 3, "lastDate": "2026-05-18" },
  "psychology": { "count": 5, "lastDate": "2026-05-17" }
}
```

## 批改逻辑

```javascript
userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
```

严格匹配，仅忽略大小写和首尾空格。

## 项目文件结构

```
ielts/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router/
│   │   └── index.js
│   ├── views/
│   │   ├── HomePage.vue
│   │   ├── PracticePage.vue
│   │   ├── ResultPage.vue
│   │   └── HistoryPage.vue
│   ├── stores/
│   │   └── practice.js
│   ├── utils/
│   │   ├── storage.js
│   │   └── checker.js
│   └── data/
│       └── corpus.json
└── README.md
```

## 依赖

- vue ^3.4
- vue-router ^4
- naive-ui ^2
- pinia ^2
- uuid
