import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { setupMock } from '@/mock'

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

const http = axios.create({
  baseURL: '/api',
  timeout: 15000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

setupMock(http)

export async function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await http.request<ApiResponse<T>>(config)
    const body = response.data
    if (body.code !== 0) {
      const message = body.message || '请求失败'
      ElMessage.error(message)
      throw new Error(message)
    }
    return body.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as { message?: string } | undefined)?.message || error.message || '网络请求失败'
      ElMessage.error(message)
      throw error
    }
    throw error
  }
}

export default http
