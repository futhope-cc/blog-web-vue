<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700"></div>
      <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 30%, white 1px, transparent 1px); background-size: 24px 24px"></div>
      <div class="relative max-w-6xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-10">
        <div class="flex-1 text-center md:text-left">
          <p class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/90 text-sm mb-5">
            <el-icon><Lightning /></el-icon> 持续学习 · 乐于分享
          </p>
          <h1 class="text-4xl md:text-5xl font-bold text-white leading-tight">
            Hi, 我是 <span class="text-amber-300">{{ profile.nickname }}</span>
          </h1>
          <p class="mt-4 text-lg md:text-xl text-indigo-100 leading-relaxed">{{ profile.slogan }}</p>
          <p class="mt-3 text-indigo-200/90 leading-relaxed max-w-xl mx-auto md:mx-0">
            {{ profile.bio }}
          </p>

          <div class="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
            <el-button type="warning" round size="large" @click="router.push('/articles')">
              <el-icon class="mr-1"><Notebook /></el-icon> 阅读博客
            </el-button>
            <el-button round size="large" class="!bg-white/15 !border-white/30 !text-white hover:!bg-white/25" @click="router.push('/projects')">
              <el-icon class="mr-1"><Suitcase /></el-icon> 查看项目
            </el-button>
          </div>

          <div class="mt-8 flex gap-4 justify-center md:justify-start">
            <a v-for="s in socials" :key="s.name" :href="s.url" target="_blank" rel="noopener"
               class="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
               :title="s.name">
              <el-icon :size="20"><component :is="s.icon" /></el-icon>
            </a>
          </div>
        </div>

        <div class="shrink-0">
          <div class="relative">
            <div class="absolute -inset-4 rounded-full bg-gradient-to-tr from-amber-300/40 to-indigo-300/40 blur-2xl"></div>
            <img :src="profile.avatar" alt="avatar" class="relative w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-white/60 shadow-2xl object-cover bg-white" />
            <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur text-xs font-medium text-slate-700 shadow">
              {{ profile.tagline }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech skills -->
    <section class="max-w-6xl mx-auto px-4 py-14">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-1 h-6 rounded bg-primary"></div>
        <h2 class="text-2xl font-bold text-slate-800">技术能力</h2>
        <el-tag type="warning" effect="light" round>技能栈</el-tag>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="skill in skills" :key="skill.name" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg" :style="{ background: skill.color }">
              <el-icon :size="20"><component :is="skill.icon" /></el-icon>
            </div>
            <h3 class="font-bold text-slate-800">{{ skill.name }}</h3>
          </div>
          <el-progress :percentage="skill.level" :stroke-width="8" :color="skill.color" :show-text="false" class="mb-3" />
          <div class="flex flex-wrap gap-1.5">
            <el-tag v-for="t in skill.tags" :key="t" size="small" effect="plain" class="!mr-0">{{ t }}</el-tag>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest articles -->
    <section class="max-w-6xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 rounded bg-primary"></div>
          <h2 class="text-2xl font-bold text-slate-800">最新文章</h2>
        </div>
        <el-link type="primary" :underline="false" @click="router.push('/articles')">
          查看全部 <el-icon class="ml-1"><ArrowRight /></el-icon>
        </el-link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ArticleCard v-for="article in latestArticles" :key="article.id" :article="article" />
      </div>
      <el-skeleton v-if="loadingArticles" :rows="6" animated class="mt-4" />
    </section>

    <!-- Projects -->
    <section class="bg-slate-900 py-14 mt-10">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div class="w-1 h-6 rounded bg-amber-400"></div>
            <h2 class="text-2xl font-bold text-white">项目展示</h2>
          </div>
          <el-link type="warning" :underline="false" @click="router.push('/projects')">
            更多项目 <el-icon class="ml-1"><ArrowRight /></el-icon>
          </el-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div v-for="project in featuredProjects" :key="project.id"
               class="group bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700/60 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer"
               @click="router.push(`/project/${project.id}`)">
            <div class="relative overflow-hidden h-36">
              <img :src="project.image" :alt="project.name" loading="lazy"
                   class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
            </div>
            <div class="p-5">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-white group-hover:text-indigo-300 transition-colors">{{ project.name }}</h3>
                <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" rel="noopener"
                   class="text-slate-400 hover:text-white transition-colors" @click.stop>
                  <el-icon><Link /></el-icon>
                </a>
              </div>
              <p class="mt-2 text-xs text-slate-400 line-clamp-2">{{ project.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section class="max-w-6xl mx-auto px-4 py-16">
      <div class="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-10 md:p-14 text-center text-white shadow-xl relative overflow-hidden">
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 70% 20%, white 1px, transparent 1px); background-size: 20px 20px"></div>
        <div class="relative">
          <h2 class="text-3xl font-bold">有兴趣一起交流吗？</h2>
          <p class="mt-3 text-indigo-100">无论是技术讨论、项目合作，还是面试邀请，都欢迎随时联系我。</p>
          <div class="mt-8 flex flex-wrap gap-4 justify-center">
            <a href="mailto:devpanda@example.com"
               class="px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2">
              <el-icon><Message /></el-icon> 发送邮件
            </a>
            <a href="https://github.com/devpanda" target="_blank" rel="noopener"
               class="px-6 py-3 rounded-xl bg-white/15 border border-white/30 hover:bg-white/25 transition-colors flex items-center gap-2">
              <el-icon><Link /></el-icon> GitHub
            </a>
          </div>
          <p class="mt-6 text-sm text-indigo-200">或直接发送邮件至 devpanda@example.com</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import { articleApi, categoryApi, projectApi } from '@/api'
import type { ArticleListItem, Project } from '@/types'

const router = useRouter()

const profile = {
  nickname: 'DevPanda',
  avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=panda',
  tagline: '全栈工程师',
  slogan: '用代码构建有趣且有用的东西',
  bio: '专注音视频、AI 推理与高可用后端架构，热衷把复杂的技术讲得简单。'
}

const socials = [
  { name: 'GitHub', icon: 'Link', url: 'https://github.com/devpanda' },
  { name: 'Gitee', icon: 'Position', url: 'https://gitee.com/devpanda' },
  { name: '掘金', icon: 'EditPen', url: 'https://juejin.cn/user/devpanda' },
  { name: '邮箱', icon: 'Message', url: 'mailto:devpanda@example.com' }
]

const skills = [
  {
    name: '后端开发',
    icon: 'Cpu',
    color: '#4f46e5',
    level: 92,
    tags: ['Java', 'Spring Boot', 'MyBatis-Plus', '高并发', '微服务']
  },
  {
    name: '音视频开发',
    icon: 'Film',
    color: '#db2777',
    level: 88,
    tags: ['FFmpeg', 'WebRTC', 'GB28181', 'HLS', 'RTMP']
  },
  {
    name: 'AI 与视觉',
    icon: 'Cpu',
    color: '#7c3aed',
    level: 85,
    tags: ['YOLO', 'OpenCV', 'TensorRT', 'PyTorch']
  },
  {
    name: '前端开发',
    icon: 'Monitor',
    color: '#0284c7',
    level: 90,
    tags: ['Vue3', 'TypeScript', 'Vite', 'Element Plus', 'TailwindCSS']
  },
  {
    name: 'DevOps 与运维',
    icon: 'Setting',
    color: '#059669',
    level: 86,
    tags: ['Docker', 'Nginx', 'Linux', 'K8s', 'CI/CD']
  },
  {
    name: '数据库',
    icon: 'Coin',
    color: '#d97706',
    level: 89,
    tags: ['MySQL', 'Redis', '索引优化', '缓存一致性']
  }
]

const loadingArticles = ref(true)
const latestArticles = ref<ArticleListItem[]>([])
const featuredProjects = ref<Project[]>([])

onMounted(async () => {
  try {
    const [articleRes, projectRes] = await Promise.all([
      articleApi.getList({ page: 1, pageSize: 3 }),
      projectApi.getList()
    ])
    latestArticles.value = articleRes.list
    featuredProjects.value = projectRes.filter((p) => p.featured === 1).slice(0, 4)
  } finally {
    loadingArticles.value = false
  }
})
</script>
