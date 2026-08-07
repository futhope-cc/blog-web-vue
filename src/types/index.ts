export interface Category {
  id: string
  name: string
  sort: number
  articleCount?: number
  createTime: string
}

export interface Tag {
  id: string
  name: string
  articleCount?: number
}

export interface ArticleListItem {
  id: string
  title: string
  summary: string
  cover: string
  categoryId: string
  categoryName?: string
  tags: Tag[]
  viewCount: number
  likeCount: number
  status: number
  createTime: string
  updateTime?: string
}

export interface ArticleDetail extends ArticleListItem {
  content: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

export interface ArticleQuery {
  current: number
  size: number
  categoryId?: string
  tagId?: string
  keyword?: string
}

export interface Project {
  id: string
  name: string
  description: string
  technology: string
  githubUrl: string
  image: string
  deployment?: string
  featured?: number
  createTime: string
}

export interface ProjectQuery {
  current: number
  size: number
  featured?: number
  keyword?: string
}

export interface SocialLink {
  name: string
  icon?: string
  url: string
}

export interface Profile {
  nickname: string
  avatar: string
  tagline: string
  bio: string
  tags: string[]
  email: string
  location: string
  socials: SocialLink[]
}
