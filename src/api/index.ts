import api from './client'
import type { MediaItem, SiteConfig, Overview } from '../types'

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { oldPassword, newPassword }).then((r) => r.data),
}

// ── Media (admin) ─────────────────────────────────────
export const mediaApi = {
  list: (params: any = {}) => api.get('/media', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/media/${id}`).then((r) => r.data),
  create: (data: Partial<MediaItem>) => api.post('/media', data).then((r) => r.data),
  update: (id: string, data: Partial<MediaItem>) => api.put(`/media/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/media/${id}`).then((r) => r.data),
}

// ── Upload ────────────────────────────────────────────
export const uploadApi = {
  file: (file: File, onProgress?: (pct: number) => void) => {
    const fd = new FormData()
    fd.append('file', file)
    return api
      .post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
      .then((r) => r.data)
  },
}

// ── Config ────────────────────────────────────────────
export const configApi = {
  get: () => api.get('/config').then((r) => r.data),
  update: (data: Partial<SiteConfig>) => api.put('/config', data).then((r) => r.data),
}

// ── Stats ─────────────────────────────────────────────
export const statsApi = {
  overview: (): Promise<{ success: boolean; stats: Overview }> =>
    api.get('/stats/overview').then((r) => r.data),
  clicks: (days = 7) => api.get('/stats/clicks', { params: { days } }).then((r) => r.data),
  recentClicks: () => api.get('/stats/recent-clicks').then((r) => r.data),
}

// ── Public (không cần token) ──────────────────────────
export const publicApi = {
  site: () => api.get('/public/site').then((r) => r.data),
  list: (params: any = {}) => api.get('/public/media', { params }).then((r) => r.data),
  detail: (id: string) => api.get(`/public/media/${id}`).then((r) => r.data),
  unlock: (id: string) => api.post(`/public/unlock/${id}`).then((r) => r.data),
  // URL cổng affiliate (mở tab mới) — backend ghi log rồi redirect 302
  goUrl: (id: string, index: number) => `/api/public/go/${id}/${index}`,
}
