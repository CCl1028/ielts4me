<template>
  <n-config-provider :theme="null">
    <n-message-provider>
      <n-layout style="min-height: 100vh;">
        <n-layout-header bordered style="padding: 12px 24px; display: flex; align-items: center; justify-content: space-between;">
          <router-link to="/" style="text-decoration: none;">
            <n-text strong style="font-size: 18px;">雅思王听力语料库练习</n-text>
          </router-link>
          <router-link to="/history" style="text-decoration: none;">
            <n-button quaternary>历史记录</n-button>
          </router-link>
        </n-layout-header>
        <n-layout-content style="padding: 24px;">
          <router-view />
        </n-layout-content>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import {
  NConfigProvider,
  NMessageProvider,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NText,
  NButton
} from 'naive-ui'
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
