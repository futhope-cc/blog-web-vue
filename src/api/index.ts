import { request } from './http'
import type {
  ArticleDetail,
  ArticleListItem,
  ArticleQuery,
  Category,
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
