<template>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <div class="mb-10 flex items-center gap-6">
      <img :src="profile.avatar" alt="avatar" class="w-24 h-24 rounded-3xl shadow-lg border-4 border-white" />
      <div>
        <h1 class="text-3xl font-bold text-slate-800">{{ profile.nickname }}</h1>
        <p class="mt-1 text-slate-500">{{ profile.tagline }}</p>
        <div class="mt-3 flex gap-3">
          <a v-for="s in socials" :key="s.name" :href="s.url" target="_blank" rel="noopener"
             class="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-colors">
            <el-icon :size="16"><component :is="s.icon" /></el-icon>
          </a>
        </div>
      </div>
    </div>

    <!-- 个人简介 -->
    <section class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-6">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-1 h-6 rounded bg-primary"></div>
        <h2 class="text-xl font-bold text-slate-800">个人简介</h2>
      </div>
      <p class="text-slate-600 leading-loose">{{ profile.bio }}</p>
      <div class="mt-4 flex flex-wrap gap-2">
        <el-tag v-for="t in profile.tags" :key="t" effect="plain" round>{{ t }}</el-tag>
      </div>
    </section>

    <!-- 技术方向 -->
    <section class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-6">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-1 h-6 rounded bg-primary"></div>
        <h2 class="text-xl font-bold text-slate-800">技术方向</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="item in directions" :key="item.title" class="rounded-xl bg-slate-50 p-5 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-slate-800 flex items-center gap-2">
            <el-icon color="#4f46e5"><component :is="item.icon" /></el-icon> {{ item.title }}
          </h3>
          <p class="mt-2 text-sm text-slate-500 leading-relaxed">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 工作经历 -->
    <section class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-6 rounded bg-primary"></div>
        <h2 class="text-xl font-bold text-slate-800">工作经历</h2>
      </div>
      <el-timeline>
        <el-timeline-item v-for="(job, index) in workExperience" :key="job.company" :timestamp="job.period"
                          :type="index === 0 ? 'primary' : 'success'" placement="top">
          <div class="rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h3 class="font-semibold text-slate-800">{{ job.position }} · {{ job.company }}</h3>
              <el-tag size="small" effect="plain" type="primary">{{ job.period }}</el-tag>
            </div>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">{{ job.desc }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>
    </section>

    <!-- 项目经验 -->
    <section class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-6 rounded bg-primary"></div>
        <h2 class="text-xl font-bold text-slate-800">项目经验</h2>
      </div>
      <div class="space-y-5">
        <div v-for="project in projects" :key="project.id"
             class="rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
             @click="router.push(`/project/${project.id}`)">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-semibold text-slate-800 hover:text-primary transition-colors">{{ project.name }}</h3>
            <span class="text-xs text-slate-400">{{ formatDate(project.createTime) }}</span>
          </div>
          <p class="mt-2 text-sm text-slate-500 leading-relaxed">{{ project.description }}</p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <el-tag v-for="tech in project.technology.split(',').slice(0, 4)" :key="tech" size="small" type="info" effect="plain" class="!mr-0">
              {{ tech.trim() }}
            </el-tag>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section class="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 shadow-lg">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1 h-6 rounded bg-white/60"></div>
        <h2 class="text-xl font-bold text-white">联系方式</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="mailto:devpanda@example.com"
           class="rounded-xl bg-white/10 border border-white/20 p-5 hover:bg-white/20 transition-colors text-white">
          <el-icon :size="24"><Message /></el-icon>
          <p class="mt-3 font-semibold">Email</p>
          <p class="text-sm text-indigo-100 mt-1 break-all">devpanda@example.com</p>
        </a>
        <a href="https://github.com/devpanda" target="_blank" rel="noopener"
           class="rounded-xl bg-white/10 border border-white/20 p-5 hover:bg-white/20 transition-colors text-white">
          <el-icon :size="24"><Link /></el-icon>
          <p class="mt-3 font-semibold">GitHub</p>
          <p class="text-sm text-indigo-100 mt-1">github.com/devpanda</p>
        </a>
        <div class="rounded-xl bg-white/10 border border-white/20 p-5 text-white">
          <el-icon :size="24"><Place /></el-icon>
          <p class="mt-3 font-semibold">所在地</p>
          <p class="text-sm text-indigo-100 mt-1">杭州 · 可远程办公</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { projectApi } from '@/api'
import type { Project } from '@/types'
import { formatDate } from '@/utils'

const router = useRouter()

const profile = {
  nickname: 'DevPanda',
  avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=panda',
  tagline: '全栈工程师 · 音视频 / AI / 后端架构',
  bio: '拥有 8 年全栈开发经验，先后负责流媒体网关、AI 推理平台与高并发后端系统的设计与落地。热爱技术分享，坚信最好的学习方式是写出来。业余时间维护开源项目、撰写技术博客，乐于通过文字帮助更多开发者。',
  tags: ['音视频', 'AI 推理', '高并发', 'DevOps', '开源爱好者', '技术写作']
}

const socials = [
  { name: 'GitHub', icon: 'Link', url: 'https://github.com/devpanda' },
  { name: 'Gitee', icon: 'Position', url: 'https://gitee.com/devpanda' },
  { name: '掘金', icon: 'EditPen', url: 'https://juejin.cn/user/devpanda' },
  { name: '邮箱', icon: 'Message', url: 'mailto:devpanda@example.com' }
]

const directions = [
  { title: '音视频技术', icon: 'Film', desc: '深耕 FFmpeg 转码、WebRTC 低延迟传输、GB28181 国标接入与流媒体网关架构。' },
  { title: 'AI 推理落地', icon: 'Cpu', desc: '专注目标检测、图像处理等 CV 任务的工程化落地，熟练 TensorRT 量化加速。' },
  { title: '后端架构', icon: 'Connection', desc: '擅长 Spring Boot 微服务、缓存一致性、高可用设计与性能优化。' },
  { title: '工程效能', icon: 'Tools', desc: '推动 Docker 化部署、CI/CD 自动化与可观测性建设，提升团队交付效率。' }
]

const workExperience = [
  {
    company: '某头部视频云公司',
    position: '高级后端工程师',
    period: '2022 - 至今',
    desc: '负责流媒体接入网关与 AI 质检平台架构，支撑日均亿级请求，主导核心模块性能优化，P99 延迟降低 80%。'
  },
  {
    company: '某智能安防企业',
    position: '后端工程师',
    period: '2019 - 2022',
    desc: '参与 GB28181 国标平台研发，从 0 搭建设备接入与录像回放系统，服务 10w+ 台接入设备。'
  },
  {
    company: '某互联网创业公司',
    position: 'Java 开发工程师',
    period: '2017 - 2019',
    desc: '负责电商后台系统研发，包括商品、订单、库存模块，经历从单体到服务化的演进过程。'
  }
]

const projects = ref<Project[]>([])

onMounted(async () => {
  projects.value = await projectApi.getList()
})
</script>
