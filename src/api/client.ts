import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// Gắn JWT vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aff_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Hết hạn token → về trang đăng nhập admin
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = String(err.config?.url || '')
    const isLogin = /\/auth\/login/.test(url)
    if (err.response?.status === 401 && !isLogin) {
      localStorage.removeItem('aff_token')
      localStorage.removeItem('aff_user')
      if (location.pathname.startsWith('/admin')) location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export default api
