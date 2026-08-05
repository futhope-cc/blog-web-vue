import { request } from './http'
import type {
  ArticleDetail,
  ArticleListItem,
  ArticleQuery,
  Category,
  CommentItem,
  PageResult,
  Project,
  Tag
} from '@/types'

export const articleApi = {
  getList(query: ArticleQuery) {
    return request<PageResult<ArticleListItem>>({ url: '/article/list', method: 'get', params: query })
  },
  getDetail(id: number) {
    return request<ArticleDetail>({ url: `/article/${id}`, method: 'get' })
  }
}

export const categoryApi = {
  getList() {
    return request<Category[]>({ url: '/category/list', method: 'get' })
  }
}

export const tagApi = {
  getList() {
    return request<Tag[]>({ url: '/tag/list', method: 'get' })
  }
}

export const projectApi = {
  getList() {
    return request<Project[]>({ url: '/project/list', method: 'get' })
  },
  getDetail(id: number) {
    return request<Project>({ url: `/project/${id}`, method: 'get' })
  }
}

export const commentApi = {
  getList(params: { articleId?: number }) {
    return request<CommentItem[]>({ url: '/comment/list', method: 'get', params })
  },
  add(data: { articleId: number; username: string; content: string; parentId?: number }) {
    return request<CommentItem>({ url: '/comment', method: 'post', data })
  }
}
