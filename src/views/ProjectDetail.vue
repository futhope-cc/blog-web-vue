<template>
  <div class="max-w-5xl mx-auto px-4 py-10">
    <div v-loading="loading" class="min-h-[300px]">
      <el-empty v-if="!loading && !project" description="项目不存在">
        <el-button type="primary" @click="router.push('/projects')">返回项目列表</el-button>
      </el-empty>

      <div v-if="project">
        <div class="rounded-3xl overflow-hidden shadow-lg bg-white">
          <img :src="resolveFileUrl(project.image)" :alt="project.name" class="w-full h-72 md:h-96 object-cover" />
          <div class="p-8 md:p-10">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <el-tag v-if="project.featured === 1" type="danger" effect="dark" class="mb-3">推荐项目</el-tag>
                <h1 class="text-3xl font-bold text-slate-900">{{ project.name }}</h1>
              </div>
              <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" rel="noopener"
                 class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition-colors">
                <el-icon :size="18"><Link /></el-icon> GitHub
              </a>
            </div>

            <p class="mt-5 text-slate-600 leading-relaxed text-lg">{{ project.description }}</p>

            <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="rounded-2xl bg-slate-50 p-5">
                <h3 class="text-sm font-bold text-slate-500 flex items-center gap-2 mb-3">
                  <el-icon color="#4f46e5"><Cpu /></el-icon> 技术栈
                </h3>
                <div class="flex flex-wrap gap-2">
                  <el-tag v-for="tech in techList" :key="tech" type="primary" effect="plain">{{ tech }}</el-tag>
                </div>
              </div>
              <div class="rounded-2xl bg-slate-50 p-5">
                <h3 class="text-sm font-bold text-slate-500 flex items-center gap-2 mb-3">
                  <el-icon color="#4f46e5"><Promotion /></el-icon> 部署方式
                </h3>
                <p class="text-sm text-slate-600 leading-relaxed">{{ project.deployment || '未提供部署说明' }}</p>
              </div>
            </div>

            <div class="mt-8 rounded-2xl bg-indigo-50 p-5 flex items-center gap-3">
              <el-icon color="#4f46e5" :size="22"><Calendar /></el-icon>
              <div>
                <p class="text-sm font-medium text-slate-700">项目创建于 {{ formatDate(project.createTime) }}</p>
                <p class="text-xs text-slate-400 mt-0.5">持续维护中，欢迎 Star 与交流</p>
              </div>
            </div>

            <div class="mt-10 flex flex-wrap gap-3">
              <el-button type="primary" size="large" round @click="router.push('/projects')">
                <el-icon class="mr-1"><Back /></el-icon> 返回项目列表
              </el-button>
              <el-button size="large" round @click="router.push('/about')">了解更多</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { projectApi } from '@/api'
import type { Project } from '@/types'
import { formatDate, resolveFileUrl } from '@/utils'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const project = ref<Project | null>(null)

const techList = computed(() =>
  (project.value?.technology || '').split(',').map((t) => t.trim()).filter(Boolean)
)

onMounted(async () => {
  loading.value = true
  try {
    project.value = await projectApi.getDetail(String(route.params.id))
  } finally {
    loading.value = false
  }
})
</script>
