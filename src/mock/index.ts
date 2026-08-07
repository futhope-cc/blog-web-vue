import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import {
  mockArticles,
  mockCategories,
  mockProfile,
  mockProjects,
  mockTags
} from './data'
import type {
  ArticleDetail,
  ArticleListItem,
  PageResult,
  Project,
  ProjectQuery
} from '@/types'

function delay(ms = 260) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface MockContext {
  articles: ArticleDetail[]
  categories: typeof mockCategories
  tags: typeof mockTags
  projects: Project[]
}

const ctx: MockContext = {
  articles: JSON.parse(JSON.stringify(mockArticles)),
  categories: JSON.parse(JSON.stringify(mockCategories)),
  tags: JSON.parse(JSON.stringify(mockTags)),
  projects: JSON.parse(JSON.stringify(mockProjects))
}

const ok = (data: unknown) => ({ code: 0, message: 'success', data })
const fail = (message: string, code = 500) => ({ code, message, data: null })

type MockResult = { code: number; message: string; data: unknown }

function toListItem(a: ArticleDetail): ArticleListItem {
  return {
    id: a.id,
    title: a.title,
    summary: a.summary,
    cover: a.cover,
    categoryId: a.categoryId,
    categoryName: ctx.categories.find((c) => c.id === a.categoryId)?.name,
    tags: a.tags,
    viewCount: a.viewCount,
    likeCount: a.likeCount,
    status: a.status,
    createTime: a.createTime,
    updateTime: a.updateTime
  }
}

function paginate<T>(list: T[], current: number, size: number): PageResult<T> {
  const total = list.length
  const start = (current - 1) * size
  return {
    records: list.slice(start, start + size),
    total,
    current,
    size
  }
}

function parseParams(url: string) {
  const qs = (url.split('?')[1] || '').split('&').filter(Boolean)
  const params: Record<string, string> = {}
  qs.forEach((item) => {
    const [k, v] = item.split('=')
    params[decodeURIComponent(k)] = decodeURIComponent(v || '')
  })
  return params
}

function makeResponse(result: MockResult, config: InternalAxiosRequestConfig) {
  const status = result.code === 0 ? 200 : 404
  return {
    data: result,
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    headers: {},
    config,
    request: {}
  }
}

export function setupMock(instance: AxiosInstance) {
  instance.interceptors.request.use(async (config) => {
    const { url = '', method = 'get' } = config
    if (!url.startsWith('/')) return config

    const m = method.toLowerCase()
    const params: Record<string, string> = {}
    if (config.params) {
      Object.entries(config.params as Record<string, unknown>).forEach(([k, v]) => {
        params[k] = Array.isArray(v) ? v.join(',') : String(v ?? '')
      })
    }
    Object.assign(params, parseParams(url))
    const cleanUrl = url.split('?')[0]

    await delay()

    let result: MockResult = fail(`未匹配到模拟接口: ${m.toUpperCase()} ${url}`, 404)

    if (cleanUrl === '/article/list' && m === 'get') {
      const current = Math.max(1, Number(params.current || 1))
      const size = Math.max(1, Number(params.size || 10))
      const categoryId = params.categoryId || undefined
      const tagId = params.tagId || undefined
      const keyword = params.keyword || undefined
      let list = ctx.articles.filter((a) => a.status === 1)
      if (categoryId) list = list.filter((a) => a.categoryId === categoryId)
      if (tagId) list = list.filter((a) => a.tags.some((t) => t.id === tagId))
      if (keyword) {
        const kw = keyword.trim().toLowerCase()
        list = list.filter(
          (a) =>
            a.title.toLowerCase().includes(kw) ||
            a.summary.toLowerCase().includes(kw) ||
            a.content.toLowerCase().includes(kw) ||
            a.tags.some((t) => t.name.toLowerCase().includes(kw))
        )
      }
      result = ok(paginate(list.map(toListItem), current, size))
    } else if (cleanUrl.match(/^\/article\/[^/]+$/) && m === 'get') {
      const id = cleanUrl.split('/').pop()
      const article = ctx.articles.find((a) => a.id === id)
      if (!article || article.status !== 1) {
        result = fail('文章不存在', 404)
      } else {
        article.viewCount += 1
        result = ok({ ...toListItem(article), content: article.content })
      }
    } else if (cleanUrl === '/category/list' && m === 'get') {
      const map: Record<string, number> = {}
      ctx.articles.filter((a) => a.status === 1).forEach((a) => {
        map[a.categoryId] = (map[a.categoryId] || 0) + 1
      })
      result = ok(ctx.categories.map((c) => ({ ...c, articleCount: map[c.id] || 0 })))
    } else if (cleanUrl === '/tag/list' && m === 'get') {
      const map: Record<string, number> = {}
      ctx.articles.filter((a) => a.status === 1).forEach((a) => {
        a.tags.forEach((t) => {
          map[t.id] = (map[t.id] || 0) + 1
        })
      })
      result = ok(ctx.tags.map((t) => ({ ...t, articleCount: map[t.id] || 0 })))
    } else if (cleanUrl === '/project/list' && m === 'get') {
      const current = Math.max(1, Number(params.current || 1))
      const size = Math.max(1, Number(params.size || 10))
      const query: ProjectQuery = {
        current,
        size,
        featured: params.featured ? Number(params.featured) : undefined,
        keyword: params.keyword || undefined
      }
      let list = ctx.projects
      if (query.featured !== undefined) list = list.filter((p) => p.featured === query.featured)
      if (query.keyword) {
        const kw = query.keyword.trim().toLowerCase()
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(kw) ||
            p.description.toLowerCase().includes(kw) ||
            p.technology.toLowerCase().includes(kw)
        )
      }
      result = ok(paginate(list, current, size))
    } else if (cleanUrl.match(/^\/project\/[^/]+$/) && m === 'get') {
      const id = cleanUrl.split('/').pop()
      const project = ctx.projects.find((p) => p.id === id)
      result = project ? ok(project) : fail('项目不存在', 404)
    } else if (cleanUrl === '/profile' && m === 'get') {
      result = ok(JSON.parse(JSON.stringify(mockProfile)))
    }

    config.adapter = async () => makeResponse(result, config)
    return config
  })
}
