<template>
  <n-config-provider :theme="null">
    <n-message-provider>
      <div class="app-wrapper">
        <header class="app-header">
          <router-link to="/" class="logo-link">
            <span class="logo-icon">📝</span>
            <span class="logo-text">雅思听力语料库</span>
          </router-link>
          <nav class="nav-links">
            <router-link to="/" class="nav-item">
              <n-button quaternary size="small">首页</n-button>
            </router-link>
            <router-link to="/history" class="nav-item">
              <n-button quaternary size="small">历史记录</n-button>
            </router-link>
          </nav>
        </header>
        <main class="app-content">
          <router-view />
        </main>
        <footer class="app-footer">
          <n-text depth="3" style="font-size: 12px;">配合《雅思王听力真题语料库》使用 · 坚持练习，听力满分</n-text>
        </footer>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import {
  NConfigProvider,
  NMessageProvider,
  NText,
  NButton
} from 'naive-ui'
</script>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 12px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}
.logo-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-icon {
  font-size: 24px;
}
.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.nav-links {
  display: flex;
  gap: 4px;
}
.nav-item {
  text-decoration: none;
}
.app-content {
  flex: 1;
  padding: 32px 24px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}
.app-footer {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
}
.app-footer .n-text {
  color: rgba(255, 255, 255, 0.7) !important;
}
</style>
