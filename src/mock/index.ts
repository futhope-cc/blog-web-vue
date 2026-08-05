import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import {
  mockArticles,
  mockCategories,
  mockComments,
  mockProjects,
  mockTags
} from './data'
import type {
  ArticleDetail,
  ArticleQuery,
  ArticleListItem,
  CommentItem,
  Project
} from '@/types'

function delay(ms = 260) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface MockContext {
  articles: ArticleDetail[]
  categories: typeof mockCategories
  tags: typeof mockTags
  projects: Project[]
  comments: CommentItem[]
}

const ctx: MockContext = {
  articles: JSON.parse(JSON.stringify(mockArticles)),
  categories: JSON.parse(JSON.stringify(mockCategories)),
  tags: JSON.parse(JSON.stringify(mockTags)),
  projects: JSON.parse(JSON.stringify(mockProjects)),
  comments: JSON.parse(JSON.stringify(mockComments))
}

const ok = (data: unknown) => ({ code: 200, message: 'success', data })
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
    commentCount: a.commentCount,
    status: a.status,
    createTime: a.createTime,
    updateTime: a.updateTime
  }
}

function filterArticles(query: ArticleQuery) {
  const { page = 1, pageSize = 10, categoryId, tagId, keyword } = query
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
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize).map(toListItem),
    total,
    page,
    pageSize
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

const nextId = (arr: { id: number }[]) => arr.reduce((m, x) => Math.max(m, x.id), 0) + 1

function makeResponse(result: MockResult, config: InternalAxiosRequestConfig) {
  const status = result.code === 200 ? 200 : 404
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
    const params = parseParams(url)
    const cleanUrl = url.split('?')[0]
    const body: Record<string, unknown> = config.data
      ? typeof config.data === 'string'
        ? JSON.parse(config.data || '{}')
        : config.data
      : {}

    await delay()

    let result: MockResult = fail(`未匹配到模拟接口: ${m.toUpperCase()} ${url}`, 404)

    if (cleanUrl === '/article/list' && m === 'get') {
      const page = Number(params.page || 1)
      const pageSize = Number(params.pageSize || 10)
      const categoryId = params.categoryId ? Number(params.categoryId) : undefined
      const tagId = params.tagId ? Number(params.tagId) : undefined
      result = ok(filterArticles({ page, pageSize, categoryId, tagId, keyword: params.keyword }))
    } else if (cleanUrl.match(/^\/article\/\d+$/) && m === 'get') {
      const id = Number(cleanUrl.split('/').pop())
      const article = ctx.articles.find((a) => a.id === id)
      if (!article || article.status !== 1) {
        result = fail('文章不存在', 404)
      } else {
        article.viewCount += 1
        result = ok({ ...toListItem(article), content: article.content })
      }
    } else if (cleanUrl === '/category/list' && m === 'get') {
      const map: Record<number, number> = {}
      ctx.articles.filter((a) => a.status === 1).forEach((a) => {
        map[a.categoryId] = (map[a.categoryId] || 0) + 1
      })
      result = ok(ctx.categories.map((c) => ({ ...c, articleCount: map[c.id] || 0 })))
    } else if (cleanUrl === '/tag/list' && m === 'get') {
      const map: Record<number, number> = {}
      ctx.articles.filter((a) => a.status === 1).forEach((a) => {
        a.tags.forEach((t) => {
          map[t.id] = (map[t.id] || 0) + 1
        })
      })
      result = ok(ctx.tags.map((t) => ({ ...t, articleCount: map[t.id] || 0 })))
    } else if (cleanUrl === '/project/list' && m === 'get') {
      result = ok(ctx.projects)
    } else if (cleanUrl.match(/^\/project\/\d+$/) && m === 'get') {
      const id = Number(cleanUrl.split('/').pop())
      const project = ctx.projects.find((p) => p.id === id)
      result = project ? ok(project) : fail('项目不存在', 404)
    } else if (cleanUrl === '/comment/list' && m === 'get') {
      const articleId = params.articleId ? Number(params.articleId) : undefined
      let list = [...ctx.comments].filter((c) => c.status === 1)
      if (articleId) list = list.filter((c) => c.articleId === articleId)
      list.sort((a, b) => (a.id > b.id ? -1 : 1))
      result = ok(list)
    } else if (cleanUrl === '/comment' && m === 'post') {
      const record = ctx.comments.find((c) => c.id === ((body.parentId as number) || 0))
      const comment: CommentItem = {
        id: nextId(ctx.comments),
        articleId: Number(body.articleId),
        username: String(body.username || '匿名用户'),
        content: String(body.content || ''),
        parentId: Number(body.parentId || 0),
        parentUsername: record?.username,
        status: 1,
        createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      ctx.comments.unshift(comment)
      result = ok(comment)
    }

    config.adapter = async () => makeResponse(result, config)
    return config
  })
}
