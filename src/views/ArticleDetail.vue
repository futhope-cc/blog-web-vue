<template>
  <div class="max-w-[1400px] mx-auto px-4 py-10">
    <div v-loading="loading" class="min-h-[400px]">
      <el-empty v-if="!loading && !article" description="文章不存在或已被删除">
        <el-button type="primary" @click="router.push('/articles')">返回文章列表</el-button>
      </el-empty>

      <div v-if="article" class="grid grid-cols-1 lg:grid-cols-[210px_1fr_210px] gap-8 items-start">
        <div>
          <!-- 文章头 -->
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div class="flex items-center gap-2 mb-4">
              <el-tag v-if="article.categoryName" type="primary" effect="light">{{ article.categoryName }}</el-tag>
              <span class="text-sm text-slate-400">{{ formatDate(article.createTime) }}</span>
              <span class="text-xs text-slate-300">·</span>
              <span class="flex items-center gap-1 text-sm text-slate-400">
                <el-icon :size="14"><View /></el-icon> {{ article.viewCount }} 阅读
              </span>
            </div>

            <h1 class="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">{{ article.title }}</h1>

            <div class="mt-4 flex items-center gap-3">
              <img :src="profile.avatar" alt="author" class="w-10 h-10 rounded-full" />
              <div>
                <p class="text-sm font-medium text-slate-700">{{ profile.nickname }}</p>
                <p class="text-xs text-slate-400">{{ profile.tagline }}</p>
              </div>
            </div>

            <img v-if="article.cover" :src="article.cover" :alt="article.title"
                 class="mt-6 w-full rounded-xl shadow-sm object-cover max-h-80" />
          </div>

          <!-- 正文 -->
          <div class="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-slate-100 mt-6">
            <MarkdownViewer :content="article.content" @toc="toc = $event" />

            <div class="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-2 items-center">
              <span class="text-sm text-slate-400 mr-1">标签：</span>
              <el-tag v-for="tag in article.tags" :key="tag.id" effect="plain"
                      class="cursor-pointer !mr-0" @click="router.push({ path: '/articles', query: { tagId: tag.id } })">
                {{ tag.name }}
              </el-tag>
            </div>

            <!-- 互动 -->
            <div class="mt-8 flex items-center justify-center gap-4">
              <el-button size="large" round :type="liked ? 'danger' : 'default'" @click="toggleLike">
                <el-icon class="mr-1"><StarFilled /></el-icon> {{ liked ? '已点赞' : '点赞' }} {{ article.likeCount }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 左侧边栏：关于作者 -->
        <aside class="hidden lg:flex flex-col gap-4 sticky top-24 order-first">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 class="text-sm font-bold text-slate-700 mb-3">关于作者</h3>
            <div class="flex items-center gap-3">
              <img :src="profile.avatar" alt="author" class="w-12 h-12 rounded-full" />
              <div>
                <p class="font-medium text-slate-800 text-sm">{{ profile.nickname }}</p>
                <p class="text-xs text-slate-400">{{ profile.tagline }}</p>
              </div>
            </div>
            <el-button size="small" round type="primary" plain class="mt-4 w-full" @click="router.push('/about')">
              了解更多
            </el-button>
          </div>
        </aside>

        <!-- 右侧边栏：文章目录 -->
        <aside class="hidden lg:block sticky top-24 order-last">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 max-h-[70vh] overflow-y-auto">
            <h3 class="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <el-icon color="#4f46e5"><Menu /></el-icon> 文章目录
            </h3>
            <nav class="space-y-1">
              <a
                v-for="item in toc"
                :key="item.id"
                :href="`#${item.id}`"
                class="block text-sm leading-relaxed transition-colors py-1 no-underline"
                :class="[
                  item.level === 1 ? 'text-slate-800 font-medium' : 'text-slate-500 hover:text-primary',
                  { 'text-primary': activeHeading === item.id },
                  { 'pl-4': item.level === 2 },
                  { 'pl-7': item.level === 3 },
                  { 'pl-10': item.level === 4 }
                ]"
                @click.prevent="scrollToHeading(item.id)"
              >
                {{ item.text }}
              </a>
            </nav>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MarkdownViewer from '@/components/MarkdownViewer.vue'
import { articleApi } from '@/api'
import type { ArticleDetail } from '@/types'
import { formatDate } from '@/utils'
import type { TocItem } from '@/utils/markdown'

const route = useRoute()
const router = useRouter()

const article = ref<ArticleDetail | null>(null)
const loading = ref(false)
const toc = ref<TocItem[]>([])
const activeHeading = ref('')
const liked = ref(false)

const profile = {
  nickname: 'DevPanda',
  avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=panda',
  tagline: '全栈工程师'
}

const articleId = computed(() => String(route.params.id))

async function fetchDetail() {
  loading.value = true
  try {
    article.value = await articleApi.getDetail(articleId.value)
  } finally {
    loading.value = false
  }
}

function toggleLike() {
  liked.value = !liked.value
  if (article.value) {
    article.value.likeCount += liked.value ? 1 : -1
  }
  ElMessage.success(liked.value ? '感谢点赞！' : '已取消点赞')
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeHeading.value = id
  }
}

function onScroll() {
  const headings = toc.value.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[]
  let current = ''
  for (const h of headings) {
    if (h.getBoundingClientRect().top <= 120) {
      current = h.id
    }
  }
  if (current) activeHeading.value = current
}

watch(
  () => route.params.id,
  () => {
    toc.value = []
    fetchDetail()
  }
)

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  fetchDetail()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>
