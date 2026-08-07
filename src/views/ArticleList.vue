<template>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-800">博客文章</h1>
      <p class="mt-2 text-slate-500">记录技术成长，沉淀实践经验</p>
    </div>

    <!-- 分类筛选 -->
    <div class="flex flex-wrap gap-2 mb-3">
      <el-radio-group v-model="categoryId" @change="handleFilterChange" class="flex-wrap">
        <el-radio-button :value="undefined">全部</el-radio-button>
        <el-radio-button v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
          <span class="text-xs opacity-70 ml-0.5">({{ cat.articleCount || 0 }})</span>
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 标签筛选 -->
    <div class="flex flex-wrap gap-2 mb-8 items-center">
      <span class="text-sm text-slate-400 mr-1">标签:</span>
      <el-tag
        v-for="tag in tags"
        :key="tag.id"
        :effect="tagId === tag.id ? 'dark' : 'plain'"
        :type="tagId === tag.id ? 'primary' : 'info'"
        class="cursor-pointer !mr-0"
        @click="handleTagClick(tag.id)"
      >
        {{ tag.name }}
      </el-tag>
    </div>

    <!-- 搜索框 -->
    <div class="max-w-xl mb-10">
      <el-input
        v-model="keyword"
        size="large"
        placeholder="搜索文章标题、摘要或内容..."
        clearable
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
        <template #append>
          <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
    </div>

    <!-- 文章列表 -->
    <div v-loading="loading" class="min-h-[240px]">
      <div v-if="!loading && articles.length === 0" class="text-center py-20 text-slate-400">
        <el-icon :size="48"><DocumentDelete /></el-icon>
        <p class="mt-4">没有找到相关文章</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </div>
    </div>

    <div v-if="total > 0" class="mt-10 flex justify-center">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import { articleApi, categoryApi, tagApi } from '@/api'
import type { ArticleListItem, Category, Tag } from '@/types'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const articles = ref<ArticleListItem[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 9

const categoryId = ref<string | undefined>(route.query.categoryId ? String(route.query.categoryId) : undefined)
const tagId = ref<string | undefined>(route.query.tagId ? String(route.query.tagId) : undefined)
const keyword = ref<string>(String(route.query.keyword || ''))

async function fetchData() {
  loading.value = true
  try {
    const res = await articleApi.getList({
      current: page.value,
      size: pageSize,
      categoryId: categoryId.value,
      tagId: tagId.value,
      keyword: keyword.value
    })
    articles.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function handleFilterChange() {
  page.value = 1
  syncQuery()
}

async function handleTagClick(id: string) {
  tagId.value = tagId.value === id ? undefined : id
  page.value = 1
  syncQuery()
}

async function handleSearch() {
  page.value = 1
  syncQuery()
}

async function handlePageChange(p: number) {
  page.value = p
  syncQuery()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function syncQuery() {
  const query: Record<string, string> = {}
  if (categoryId.value) query.categoryId = String(categoryId.value)
  if (tagId.value) query.tagId = String(tagId.value)
  if (keyword.value) query.keyword = keyword.value
  if (page.value > 1) query.page = String(page.value)
  router.replace({ path: '/articles', query })
}

watch(
  () => route.query,
  () => {
    categoryId.value = route.query.categoryId ? String(route.query.categoryId) : undefined
    tagId.value = route.query.tagId ? String(route.query.tagId) : undefined
    keyword.value = String(route.query.keyword || '')
    page.value = route.query.page ? Number(route.query.page) : 1
    fetchData()
  }
)

onMounted(async () => {
  const [catRes, tagRes] = await Promise.all([categoryApi.getList(), tagApi.getList()])
  categories.value = catRes
  tags.value = tagRes
  page.value = route.query.page ? Number(route.query.page) : 1
  await fetchData()
})
</script>
