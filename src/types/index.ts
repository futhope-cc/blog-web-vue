export interface Category {
  id: number
  name: string
  sort: number
  articleCount?: number
  createTime: string
}

export interface Tag {
  id: number
  name: string
  articleCount?: number
}

export interface ArticleListItem {
  id: number
  title: string
  summary: string
  cover: string
  categoryId: number
  categoryName?: string
  tags: Tag[]
  viewCount: number
  likeCount: number
  commentCount: number
  status: number
  createTime: string
  updateTime?: string
}

export interface ArticleDetail extends ArticleListItem {
  content: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface ArticleQuery {
  page: number
  pageSize: number
  categoryId?: number
  tagId?: number
  keyword?: string
}

export interface Project {
  id: number
  name: string
  description: string
  technology: string
  githubUrl: string
  image: string
  deployment?: string
  featured?: number
  createTime: string
}
