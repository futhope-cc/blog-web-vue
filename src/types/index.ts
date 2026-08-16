export interface Category {
  id: string
  name: string
  sort: number
  articleCount: number
}

export interface Tag {
  id: string
  name: string
  articleCount: number
}

export interface ArticleListItem {
  id: string
  title: string
  summary: string
  cover?: string
  categoryId: string
  categoryName?: string
  tagNames: string[]
  viewCount: number
  status: number
  publishTime?: string
  createTime: string
}

export interface ArticleDetail extends ArticleListItem {
  content: string
  tagIds: string[]
  updateTime?: string
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
  url: string
}

export interface TechDirection {
  title: string
  icon?: string
  desc: string
}

export interface WorkExperience {
  company: string
  position: string
  period: string
  desc: string
}

export interface Profile {
  id: string
  nickname: string
  avatar?: string
  bio: string
  techStack?: string
  socialLinks?: string
  email?: string
  github?: string
  directions?: string
  workExperience?: string
  updateTime: string
}
