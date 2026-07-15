import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import Home from './pages/public/Home'
import MediaPage from './pages/public/MediaPage'
import AdminLogin from './pages/admin/Login'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import MediaList from './pages/admin/MediaList'
import Settings from './pages/admin/Settings'
import { publicApi } from './api'
import { applyTheme } from './utils/theme'

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('aff_token')
  return token ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  const [themeColor, setThemeColor] = useState<string>('#ee4d2d')

  // Nạp màu chủ đạo từ cấu hình site và áp lên toàn trang (cả Tailwind + AntD)
  useEffect(() => {
    publicApi
      .site()
      .then((r) => {
        const c = r.config?.themeColor || '#ee4d2d'
        setThemeColor(c)
        applyTheme(c)
      })
      .catch(() => {})
  }, [])

  return (
    <ConfigProvider locale={viVN} theme={{ token: { colorPrimary: themeColor } }}>
      <Routes>
        {/* Công khai */}
        <Route path="/" element={<Home />} />
        <Route path="/m/:id" element={<MediaPage />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="media" element={<MediaList />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  )
}
