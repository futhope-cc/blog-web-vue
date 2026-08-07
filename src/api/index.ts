import { request } from './http'
import type {
  ArticleDetail,
  ArticleListItem,
  ArticleQuery,
  Category,
  PageResult,
  Profile,
  Project,
  ProjectQuery,
  Tag
} from '@/types'

export const articleApi = {
  getList(query: ArticleQuery) {
    return request<PageResult<ArticleListItem>>({ url: '/article/list', method: 'get', params: query })
  },
  getDetail(id: string) {
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
  getList(query: ProjectQuery) {
    return request<PageResult<Project>>({ url: '/project/list', method: 'get', params: query })
  },
  getDetail(id: string) {
    return request<Project>({ url: `/project/${id}`, method: 'get' })
  }
}

export const profileApi = {
  getProfile() {
    return request<Profile>({ url: '/profile', method: 'get' })
  }
}
