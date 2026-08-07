<template>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-800">搜索</h1>
      <p class="mt-2 text-slate-500">搜索文章标题、摘要或内容</p>
    </div>

    <div class="max-w-3xl mx-auto mb-10">
      <el-input
        v-model="keyword"
        size="large"
        placeholder="输入关键词，回车搜索..."
        clearable
        @keyup.enter="doSearch"
        @clear="doSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
        <template #append>
          <el-button :loading="loading" @click="doSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>

      <div class="mt-3 flex flex-wrap gap-2 items-center justify-center">
        <span class="text-sm text-slate-400 mr-1">热门：</span>
        <el-tag v-for="hot in hotKeywords" :key="hot" class="cursor-pointer !mr-0"
                effect="plain" @click="keyword = hot; doSearch()">{{ hot }}</el-tag>
      </div>
    </div>

    <div v-loading="loading" class="min-h-[200px]">
      <template v-if="!loading && searched">
        <p class="text-center text-slate-500 mb-8">
          共找到 <b class="text-primary">{{ total }}</b> 条与
          <b class="text-primary">「{{ lastKeyword }}」</b> 相关的结果
        </p>

        <div v-if="results.length" class="max-w-4xl mx-auto space-y-4">
          <div v-for="article in results" :key="article.id"
               class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer"
               @click="router.push(`/article/${article.id}`)">
            <div class="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <el-tag v-if="article.categoryName" size="small" effect="light" type="primary" class="!mr-0">
                {{ article.categoryName }}
              </el-tag>
              <span>{{ formatDate(article.createTime) }}</span>
              <span class="flex items-center gap-1"><el-icon :size="12"><View /></el-icon> {{ article.viewCount }}</span>
            </div>
            <h3 class="text-lg font-bold text-slate-800 hover:text-primary transition-colors">{{ article.title }}</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">{{ article.summary }}</p>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <el-tag v-for="tag in article.tags.slice(0, 3)" :key="tag.id" size="small" type="info" effect="plain" class="!mr-0">
                {{ tag.name }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-empty v-else description="没有找到相关文章，换个关键词试试吧" />

        <div v-if="results.length" class="mt-8 flex justify-center">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="page"
            @current-change="handlePageChange"
          />
        </div>
      </template>

      <div v-else-if="!loading" class="text-center py-16 text-slate-300">
        <el-icon :size="56"><Search /></el-icon>
        <p class="mt-4">输入关键词开始搜索</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleApi } from '@/api'
import type { ArticleListItem } from '@/types'
import { formatDate } from '@/utils'

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const lastKeyword = ref('')
const loading = ref(false)
const searched = ref(false)
const results = ref<ArticleListItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 10

const hotKeywords = ['Spring Boot', 'FFmpeg', 'YOLO', 'TensorRT', '缓存', 'Linux']

async function doSearch() {
  const kw = keyword.value.trim()
  if (!kw) {
    searched.value = true
    results.value = []
    total.value = 0
    lastKeyword.value = ''
    return
  }
  loading.value = true
  page.value = 1
  try {
    const res = await articleApi.getList({ current: 1, size: pageSize, keyword: kw })
    results.value = res.records
    total.value = res.total
    lastKeyword.value = kw
    searched.value = true
  } finally {
    loading.value = false
  }
}

async function handlePageChange(p: number) {
  page.value = p
  loading.value = true
  try {
    const res = await articleApi.getList({ current: p, size: pageSize, keyword: lastKeyword.value })
    results.value = res.records
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    loading.value = false
  }
}

watch(
  () => route.query.keyword,
  (val) => {
    if (typeof val === 'string' && val) {
      keyword.value = val
      doSearch()
    }
  }
)

onMounted(() => {
  const kw = route.query.keyword
  if (typeof kw === 'string' && kw) {
    keyword.value = kw
    doSearch()
  }
})
</script>
