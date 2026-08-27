<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-[#07041a]">
      <!-- 深空渐变背景 -->
      <div class="absolute inset-0" style="background:
        radial-gradient(ellipse at 15% 15%, rgba(124, 58, 237, 0.35), transparent 55%),
        radial-gradient(ellipse at 85% 5%, rgba(14, 165, 233, 0.25), transparent 50%),
        radial-gradient(ellipse at 60% 90%, rgba(219, 39, 119, 0.18), transparent 50%),
        linear-gradient(180deg, #07041a 0%, #150a38 70%, #1b0f45 100%)"></div>

      <!-- 星光粒子 -->
      <div class="stars" aria-hidden="true"></div>
      <div class="stars stars-2" aria-hidden="true"></div>

      <!-- 漂浮光球 -->
      <div class="orb orb-1" aria-hidden="true"></div>
      <div class="orb orb-2" aria-hidden="true"></div>
      <div class="orb orb-3" aria-hidden="true"></div>

      <!-- 透视网格地面 -->
      <div class="grid-floor" aria-hidden="true"></div>

      <!-- 扫描线 -->
      <div class="scanlines" aria-hidden="true"></div>

      <div class="relative max-w-6xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
        <div class="flex-1 text-center md:text-left">
          <p class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-400/40 bg-violet-500/10 text-violet-200 text-sm mb-5 backdrop-blur-sm">
            <el-icon><Lightning /></el-icon> 持续学习 · 乐于分享
          </p>

          <p class="font-mono text-sm text-cyan-300/90 mb-4 flex items-center justify-center md:justify-start gap-1">
            <span class="text-violet-300">&gt;</span>
            welcome_to_my_space
            <span class="inline-block w-2 h-4 bg-cyan-300/90 animate-pulse"></span>
          </p>

          <h1 class="text-4xl md:text-5xl font-bold text-white leading-tight">
            Hi, 我是
            <span class="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(167,139,250,0.55)]">
              {{ profile?.nickname }}
            </span>
          </h1>
          <p class="mt-4 text-lg md:text-xl text-slate-200 leading-relaxed">{{ profileTagline(profile) }}</p>
          <p class="mt-3 text-slate-400 leading-relaxed max-w-xl mx-auto md:mx-0">
            {{ profile?.bio }}
          </p>

          <div class="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
            <el-button type="warning" round size="large" @click="router.push('/articles')">
              <el-icon class="mr-1"><Notebook /></el-icon> 阅读博客
            </el-button>
            <el-button round size="large" class="!bg-white/5 !border-cyan-400/40 !text-cyan-200 hover:!bg-cyan-400/10" @click="router.push('/projects')">
              <el-icon class="mr-1"><Suitcase /></el-icon> 查看项目
            </el-button>
          </div>

          <div class="mt-8 flex gap-4 justify-center md:justify-start">
            <a v-for="s in socials" :key="s.name" :href="s.url" target="_blank" rel="noopener"
               class="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 transition-all hover:border-cyan-400/60 hover:text-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
               :title="s.name">
              <el-icon :size="20"><component :is="socialIcon(s.name)" /></el-icon>
            </a>
          </div>
        </div>

        <div class="shrink-0">
          <div class="relative">
            <div class="absolute -inset-8 rounded-full bg-violet-600/30 blur-3xl"></div>
            <div class="sci-ring absolute" aria-hidden="true"></div>
            <div class="absolute -inset-3 rounded-full border border-dashed border-violet-400/30 animate-[spin_24s_linear_infinite]" aria-hidden="true"></div>
            <img :src="resolveAvatar(profile?.avatar)" alt="avatar"
                 class="relative w-48 h-48 md:w-56 md:h-56 rounded-full border-2 border-violet-300/40 object-cover bg-[#0d0730] shadow-[0_0_50px_rgba(124,58,237,0.45)]" />
          </div>
        </div>
      </div>
    </section>

    <!-- Latest articles -->
    <section class="py-14">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div class="w-1 h-6 rounded bg-primary"></div>
            <h2 class="text-2xl font-bold text-slate-800">最新文章</h2>
          </div>
          <el-link type="primary" :underline="false" @click="router.push('/articles')">
            查看全部 <el-icon class="ml-1"><ArrowRight /></el-icon>
          </el-link>
        </div>

        <div class="max-w-3xl mx-auto grid grid-cols-1 gap-6">
          <ArticleCard v-for="article in latestArticles" :key="article.id" :article="article" tall />
        </div>
        <el-skeleton v-if="loadingArticles" :rows="6" animated class="mt-4" />
      </div>
    </section>

    <!-- Projects -->
    <section class="bg-[#120b33] py-14">
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
              <img :src="resolveFileUrl(project.image)" :alt="project.name" loading="lazy"
                   class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
            </div>
            <div class="p-5">
              <h3 class="font-bold text-white group-hover:text-indigo-300 transition-colors">{{ project.name }}</h3>
              <p class="mt-2 text-xs text-slate-400 line-clamp-2">{{ project.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section class="bg-[#120b33] py-16">
      <div class="max-w-6xl mx-auto px-4">
        <div class="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-10 md:p-14 text-center text-white shadow-xl relative overflow-hidden">
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 70% 20%, white 1px, transparent 1px); background-size: 20px 20px"></div>
        <div class="relative">
          <h2 class="text-3xl font-bold">有兴趣一起交流吗？</h2>
          <p class="mt-3 text-indigo-100">无论是技术讨论、项目合作，还是面试邀请，都欢迎随时联系我。</p>
          <div class="mt-8 flex flex-wrap gap-4 justify-center">
            <a :href="'mailto:' + (profile?.email || '')"
               class="px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2">
              <el-icon><Message /></el-icon> 发送邮件
            </a>
          </div>
        </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import { articleApi, profileApi, projectApi } from '@/api'
import type { ArticleListItem, Profile, Project } from '@/types'
import { buildSocials, profileTagline, resolveAvatar, resolveFileUrl, socialIcon } from '@/utils'

const router = useRouter()

const profile = ref<Profile | null>(null)
const socials = computed(() => buildSocials(profile.value))

const loadingArticles = ref(true)
const latestArticles = ref<ArticleListItem[]>([])
const featuredProjects = ref<Project[]>([])

onMounted(async () => {
  try {
    const [profileRes, articleRes, projectRes] = await Promise.all([
      profileApi.getProfile(),
      articleApi.getList({ current: 1, size: 6 }),
      projectApi.getList({ current: 1, size: 4, featured: 1 })
    ])
    profile.value = profileRes
    latestArticles.value = articleRes.records
    featuredProjects.value = projectRes.records
  } finally {
    loadingArticles.value = false
  }
})
</script>

<style scoped>
/* 星光粒子 */
.stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(1px 1px at 12% 28%, rgba(255, 255, 255, 0.9), transparent 60%),
    radial-gradient(1px 1px at 28% 62%, rgba(255, 255, 255, 0.7), transparent 60%),
    radial-gradient(1.5px 1.5px at 38% 18%, rgba(255, 255, 255, 0.85), transparent 60%),
    radial-gradient(1px 1px at 52% 45%, rgba(255, 255, 255, 0.6), transparent 60%),
    radial-gradient(1.5px 1.5px at 62% 78%, rgba(255, 255, 255, 0.75), transparent 60%),
    radial-gradient(1px 1px at 73% 30%, rgba(255, 255, 255, 0.65), transparent 60%),
    radial-gradient(1px 1px at 86% 65%, rgba(255, 255, 255, 0.8), transparent 60%),
    radial-gradient(1.5px 1.5px at 94% 22%, rgba(255, 255, 255, 0.6), transparent 60%),
    radial-gradient(1px 1px at 8% 82%, rgba(255, 255, 255, 0.55), transparent 60%),
    radial-gradient(1px 1px at 44% 90%, rgba(255, 255, 255, 0.5), transparent 60%);
  animation: twinkle 5s ease-in-out infinite alternate;
}

.stars-2 {
  background-image:
    radial-gradient(1.5px 1.5px at 18% 12%, rgba(103, 232, 249, 0.8), transparent 60%),
    radial-gradient(1px 1px at 32% 42%, rgba(196, 181, 253, 0.7), transparent 60%),
    radial-gradient(1px 1px at 47% 72%, rgba(103, 232, 249, 0.6), transparent 60%),
    radial-gradient(1.5px 1.5px at 58% 15%, rgba(196, 181, 253, 0.75), transparent 60%),
    radial-gradient(1px 1px at 68% 55%, rgba(103, 232, 249, 0.55), transparent 60%),
    radial-gradient(1px 1px at 82% 88%, rgba(196, 181, 253, 0.6), transparent 60%),
    radial-gradient(1.5px 1.5px at 92% 40%, rgba(103, 232, 249, 0.65), transparent 60%),
    radial-gradient(1px 1px at 6% 52%, rgba(196, 181, 253, 0.55), transparent 60%);
  animation-delay: -2.5s;
  animation-duration: 7s;
}

@keyframes twinkle {
  0% { opacity: 0.35; }
  100% { opacity: 1; }
}

/* 漂浮光球 */
.orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(70px);
  opacity: 0.45;
  pointer-events: none;
  animation: orb-float 9s ease-in-out infinite;
}

.orb-1 {
  width: 26rem;
  height: 26rem;
  background: #7c3aed;
  top: -8rem;
  left: -6rem;
}

.orb-2 {
  width: 22rem;
  height: 22rem;
  background: #0ea5e9;
  bottom: -6rem;
  right: -4rem;
  animation-delay: -4.5s;
}

.orb-3 {
  width: 14rem;
  height: 14rem;
  background: #db2777;
  top: 32%;
  left: 52%;
  opacity: 0.3;
  animation-delay: -2s;
}

@keyframes orb-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-28px) scale(1.06); }
}

/* 透视网格地面 */
.grid-floor {
  position: absolute;
  left: -20%;
  right: -20%;
  bottom: -45%;
  height: 55%;
  background-image:
    linear-gradient(rgba(129, 140, 248, 0.35) 1px, transparent 1px),
    linear-gradient(90deg, rgba(129, 140, 248, 0.35) 1px, transparent 1px);
  background-size: 36px 36px;
  transform: perspective(600px) rotateX(62deg);
  -webkit-mask-image: linear-gradient(to top, transparent, rgba(0, 0, 0, 0.85) 25%, rgba(0, 0, 0, 0.85) 55%, transparent 68%);
  mask-image: linear-gradient(to top, transparent, rgba(0, 0, 0, 0.85) 25%, rgba(0, 0, 0, 0.85) 55%, transparent 68%);
  animation: grid-flow 3.2s linear infinite;
  pointer-events: none;
}

@keyframes grid-flow {
  to { background-position: 0 36px, 36px 0; }
}

/* 扫描线 */
.scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(to bottom, transparent 0 3px, rgba(255, 255, 255, 0.025) 3px 4px);
}

/* 头像光环 */
.sci-ring {
  position: absolute;
  inset: -10px;
  border-radius: 9999px;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(34, 211, 238, 0.9) 80deg,
    transparent 160deg,
    transparent 200deg,
    rgba(167, 139, 250, 0.9) 280deg,
    transparent 360deg
  );
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
  animation: ring-spin 5s linear infinite;
}

@keyframes ring-spin {
  to { transform: rotate(360deg); }
}
</style>
