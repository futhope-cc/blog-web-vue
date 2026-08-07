<template>
  <article
    :class="[
      'group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col',
      dark
        ? 'bg-[#241557]/80 border border-violet-400/20 hover:shadow-violet-500/20'
        : 'bg-white border border-slate-100'
    ]"
  >
    <router-link
      :to="`/article/${article.id}`"
      :class="[
        'relative block overflow-hidden',
        tall ? 'aspect-[16/9]' : 'h-44',
        dark ? 'bg-[#1b0f45]' : 'bg-slate-100'
      ]"
    >
      <img
        :src="article.cover"
        :alt="article.title"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <span
        v-if="article.categoryName"
        class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs text-white bg-primary/90 backdrop-blur"
      >
        {{ article.categoryName }}
      </span>
    </router-link>

    <div class="p-5 flex flex-col flex-1">
      <router-link :to="`/article/${article.id}`">
        <h3 :class="['text-lg font-bold leading-snug line-clamp-2 transition-colors', dark ? 'text-white group-hover:text-cyan-300' : 'text-slate-800 group-hover:text-primary']">
          {{ article.title }}
        </h3>
      </router-link>
      <p :class="['mt-2 text-sm leading-relaxed line-clamp-2 flex-1', dark ? 'text-slate-400' : 'text-slate-500']">{{ article.summary }}</p>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <el-tag
          v-for="tag in article.tags.slice(0, 3)"
          :key="tag.id"
          size="small"
          effect="plain"
          :class="['!mr-0', dark ? '!bg-violet-500/10 !text-violet-200 !border-violet-400/30' : '']"
          @click="router.push({ path: '/articles', query: { tagId: tag.id } })"
        >
          {{ tag.name }}
        </el-tag>
      </div>

      <div :class="['mt-4 pt-3 flex items-center justify-between text-xs', dark ? 'border-t border-violet-400/10 text-slate-400' : 'border-t border-slate-100 text-slate-400']">
        <span>{{ timeAgo(article.createTime) }}</span>
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1"><el-icon :size="13"><View /></el-icon>{{ formatCount(article.viewCount) }}</span>
          <span class="flex items-center gap-1"><el-icon :size="13"><Star /></el-icon>{{ formatCount(article.likeCount) }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ArticleListItem } from '@/types'
import { timeAgo } from '@/utils'

defineProps<{ article: ArticleListItem; dark?: boolean; tall?: boolean }>()

const router = useRouter()

function formatCount(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
</script>
