<template>
  <div class="min-h-screen flex flex-col bg-[#f6f7fb]">
    <header class="sticky top-0 z-40 backdrop-blur-md bg-white/85 border-b border-slate-200 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 group">
          <img :src="userAvatar" alt="logo" class="w-9 h-9 rounded-lg shadow" />
          <span class="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">
            {{ siteName }}
          </span>
        </router-link>

        <nav class="hidden md:flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-primary hover:bg-indigo-50 transition-colors"
            :class="{ 'text-primary bg-indigo-50': isActive(item.path) }"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <el-button
          class="md:!hidden !border-none !text-xl"
          text
          @click="mobileMenu = !mobileMenu"
        >
          <el-icon :size="22"><Menu /></el-icon>
        </el-button>
      </div>

      <div v-if="mobileMenu" class="md:hidden border-t border-slate-100 bg-white px-4 py-2">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="block py-3 px-2 rounded-lg text-slate-700 hover:bg-indigo-50"
          @click="mobileMenu = false"
        >
          {{ item.label }}
        </router-link>
      </div>
    </header>

    <main class="flex-1">
      <router-view />
    </main>

    <footer class="bg-slate-900 text-slate-300">
      <div class="max-w-6xl mx-auto px-4 py-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <img :src="userAvatar" alt="avatar" class="w-8 h-8 rounded-lg" />
              <span class="font-bold text-white text-lg">{{ siteName }}</span>
            </div>
            <p class="text-sm text-slate-400 leading-relaxed">
              一个专注技术沉淀与项目展示的个人站点，分享音视频、AI 与后端架构实践。
            </p>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-3">快速导航</h4>
            <ul class="space-y-2 text-sm">
              <li><router-link to="/articles" class="hover:text-white transition-colors">文章列表</router-link></li>
              <li><router-link to="/projects" class="hover:text-white transition-colors">项目展示</router-link></li>
              <li><router-link to="/about" class="hover:text-white transition-colors">关于我</router-link></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-3">联系我</h4>
            <ul class="space-y-2 text-sm text-slate-400">
              <li class="flex items-center gap-2"><el-icon><Message /></el-icon> {{ profile?.email }}</li>
              <li class="flex items-center gap-2"><el-icon><Link /></el-icon> {{ githubDisplay }}</li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-6 border-t border-slate-700/60 text-center text-xs text-slate-500">
          Copyright © {{ year }} futhope
          <span v-if="profile?.copyright" class="ml-2">| {{ profile.copyright }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { profileApi } from '@/api'
import type { Profile } from '@/types'
import { buildSocials, resolveAvatar } from '@/utils'

const profile = ref<Profile | null>(null)

const githubUrl = computed(() => {
  const g = profile.value?.github
  return g || 'https://github.com'
})
const githubDisplay = computed(() => {
  return githubUrl.value.replace(/^https?:\/\//, '')
})

const siteName = '逻辑回响'
const userAvatar = computed(() => resolveAvatar(profile.value?.avatar))

const navItems = [
  { path: '/', label: '首页' },
  { path: '/articles', label: '博客' },
  { path: '/projects', label: '项目' },
  { path: '/about', label: '关于我' },
  { path: '/search', label: '搜索' }
]

const route = useRoute()
const mobileMenu = ref(false)
const year = new Date().getFullYear()

onMounted(async () => {
  try {
    profile.value = await profileApi.getProfile()
  } catch {}
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
