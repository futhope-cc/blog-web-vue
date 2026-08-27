<template>
  <div
    class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 flex flex-col"
  >
    <router-link :to="`/project/${project.id}`" class="relative block overflow-hidden h-48 bg-slate-100">
      <img
        :src="resolveFileUrl(project.image)"
        :alt="project.name"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <el-tag
        v-if="project.featured === 1"
        type="danger"
        effect="dark"
        size="small"
        class="absolute top-3 right-3 !border-none"
      >
        推荐项目
      </el-tag>
    </router-link>

    <div class="p-5 flex flex-col flex-1">
      <div class="flex items-start justify-between gap-2">
        <router-link :to="`/project/${project.id}`">
          <h3 class="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">{{ project.name }}</h3>
        </router-link>
      </div>
      <p class="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">{{ project.description }}</p>

      <div class="mt-4 pt-3 border-t border-slate-100">
        <div class="flex flex-wrap gap-1.5">
          <el-tag v-for="tech in techList" :key="tech" size="small" type="info" effect="plain" class="!mr-0">
            {{ tech }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/types'
import { resolveFileUrl } from '@/utils'

const props = defineProps<{ project: Project }>()

const techList = props.project.technology.split(',').map((t) => t.trim()).filter(Boolean)
</script>
