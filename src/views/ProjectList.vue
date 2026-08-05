<template>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-slate-800">项目展示</h1>
      <p class="mt-2 text-slate-500">分享参与过的技术项目与开源作品</p>
    </div>

    <div v-loading="loading" class="min-h-[240px]">
      <div v-if="!loading && projects.length === 0" class="text-center py-20 text-slate-400">
        <el-empty description="暂无项目" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ProjectCard from '@/components/ProjectCard.vue'
import { projectApi } from '@/api'
import type { Project } from '@/types'

const loading = ref(false)
const projects = ref<Project[]>([])

onMounted(async () => {
  loading.value = true
  try {
    projects.value = await projectApi.getList()
  } finally {
    loading.value = false
  }
})
</script>
