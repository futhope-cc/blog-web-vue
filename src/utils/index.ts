import type { Profile, SocialLink, TechDirection, WorkExperience } from '@/types'

export function formatDate(value: string | number | Date, withTime = false): string {
  if (!value) return ''
  const d = typeof value === 'string' && !value.includes('T') ? new Date(value.replace(' ', 'T')) : new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return withTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date
}

export function timeAgo(value: string | number | Date): string {
  if (!value) return ''
  const d = new Date(typeof value === 'string' && !value.includes('T') ? value.replace(' ', 'T') : value)
  const diff = Date.now() - d.getTime()
  const min = 60 * 1000
  const hour = 60 * min
  const day = 24 * hour
  if (diff < min) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / min)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`
  return formatDate(value)
}

export function formatSize(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(1)} ${units[i]}`
}

/**
 * 后端文件 URL 规范化：本地存储返回的是 `/files/...` 相对路径，
 * 实际可访问地址需加上 context-path `/api`（前端通过 vite 代理转发）。
 */
export function resolveFileUrl(url?: string | null): string {
  if (!url) return ''
  if (url.startsWith('/files/')) return `/api${url}`
  return url
}

const DEFAULT_AVATAR = 'https://api.dicebear.com/9.x/notionists/svg?seed=panda'

export function resolveAvatar(url?: string | null): string {
  return resolveFileUrl(url) || DEFAULT_AVATAR
}

/**
 * 技术栈字段（逗号分隔字符串）拆分为数组。
 */
export function parseTechStack(techStack?: string | null): string[] {
  if (!techStack) return []
  return techStack
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * 社交链接字段为 JSON 字符串，容忍空值/异常格式。
 */
export function parseSocialLinks(socialLinks?: string | null): SocialLink[] {
  if (!socialLinks) return []
  try {
    const parsed = JSON.parse(socialLinks)
    if (Array.isArray(parsed)) {
      return parsed.filter((l) => l && typeof l.name === 'string' && typeof l.url === 'string')
    }
    if (Array.isArray(parsed?.links)) {
      return parsed.links.filter((l: SocialLink) => l && typeof l.name === 'string' && typeof l.url === 'string')
    }
  } catch {
    /* 忽略非法 JSON */
  }
  return []
}

/**
 * 组装个人社交链接：仅取 socialLinks JSON 字段，不再自动补充 gitee / email。
 */
export function buildSocials(profile: Profile | null | undefined): SocialLink[] {
  if (!profile) return []
  return parseSocialLinks(profile.socialLinks)
}

const SOCIAL_ICONS: Record<string, string> = {
  Gitee: 'Position',
  Email: 'Message',
  邮箱: 'Message',
  Mail: 'Message',
  掘金: 'EditPen',
  CSDN: 'Document',
  博客: 'Document',
  微信: 'ChatDotRound',
  公众号: 'ChatDotRound',
  知乎: 'Document',
  哔哩哔哩: 'VideoPlay',
  B站: 'VideoPlay'
}

export function socialIcon(name: string): string {
  return SOCIAL_ICONS[name] || SOCIAL_ICONS[name.toLowerCase()] || 'Link'
}

/**
 * 技术方向字段为 JSON 字符串，容错解析。合法元素需含 title/desc，icon 缺省时用默认图标。
 */
export function parseDirections(directions?: string | null): TechDirection[] {
  if (!directions) return []
  try {
    const parsed = JSON.parse(directions)
    if (Array.isArray(parsed)) {
      return parsed.filter((d) => d && typeof d.title === 'string' && typeof d.desc === 'string')
    }
  } catch {
    /* 忽略非法 JSON */
  }
  return []
}

/**
 * 工作经历字段为 JSON 字符串，容错解析。合法元素需含 company/position/period/desc。
 */
export function parseWorkExperience(workExperience?: string | null): WorkExperience[] {
  if (!workExperience) return []
  try {
    const parsed = JSON.parse(workExperience)
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (w) =>
          w &&
          typeof w.company === 'string' &&
          typeof w.position === 'string' &&
          typeof w.period === 'string' &&
          typeof w.desc === 'string'
      )
    }
  } catch {
    /* 忽略非法 JSON */
  }
  return []
}

/**
 * 后端无 tagline 字段，用技术栈拼装副标题。
 */
export function profileTagline(profile: Profile | null | undefined): string {
  const stack = parseTechStack(profile?.techStack)
  return stack.length ? stack.join(' · ') : '持续学习 · 乐于分享'
}
