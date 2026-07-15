import { useState } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { Layout, Menu, Button, Drawer, Grid } from 'antd'
import { LayoutDashboard, Film, Settings as SettingsIcon, LogOut, ExternalLink, Menu as MenuIcon, Users as UsersIcon } from 'lucide-react'
import { APP_VERSION } from '../version'
import type { ReactNode } from 'react'

const { Sider, Header, Content } = Layout
const { useBreakpoint } = Grid

export default function AdminLayout() {
  const nav = useNavigate()
  const loc = useLocation()
  const screens = useBreakpoint()
  const isMobile = !screens.lg
  const [drawerOpen, setDrawerOpen] = useState(false)
  const user = JSON.parse(localStorage.getItem('aff_user') || '{}')

  const logout = () => {
    localStorage.removeItem('aff_token')
    localStorage.removeItem('aff_user')
    nav('/admin/login')
  }

  const current = loc.pathname.split('/')[2] || 'dashboard'

  const logo = (
    <div className="pt-3 pb-2 px-4">
      <div className="flex items-center gap-2 font-bold text-brand">
        <span className="text-2xl">🔥</span> Affiliate Hub
      </div>
      <div className="text-[11px] text-gray-400 mt-0.5 pl-9">Phiên bản v{APP_VERSION}</div>
    </div>
  )

  const isAdmin = user.role === 'Admin'
  const menuItems: { key: string; icon: ReactNode; label: ReactNode }[] = [
    { key: 'dashboard', icon: <LayoutDashboard size={18} />, label: <Link to="/admin/dashboard">Tổng quan</Link> },
    { key: 'media', icon: <Film size={18} />, label: <Link to="/admin/media">Nội dung</Link> },
  ]
  if (isAdmin) {
    menuItems.push(
      { key: 'users', icon: <UsersIcon size={18} />, label: <Link to="/admin/users">Người dùng</Link> },
      { key: 'settings', icon: <SettingsIcon size={18} />, label: <Link to="/admin/settings">Cài đặt</Link> }
    )
  }
  const menu = <Menu mode="inline" selectedKeys={[current]} onClick={() => setDrawerOpen(false)} items={menuItems} />

  return (
    <Layout className="min-h-screen">
      {/* Sidebar chỉ hiện trên màn hình lớn */}
      {!isMobile && (
        <Sider theme="light" width={220} className="border-r">
          {logo}
          {menu}
        </Sider>
      )}

      {/* Drawer điều hướng cho mobile */}
      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={250}
        styles={{ body: { padding: 0 }, header: { display: 'none' } }}
      >
        {logo}
        {menu}
        <div className="px-4 mt-2">
          <a href="/" target="_blank" className="text-gray-500 hover:text-brand flex items-center gap-2 text-sm py-2">
            <ExternalLink size={16} /> Xem trang web
          </a>
        </div>
      </Drawer>

      <Layout>
        <Header
          className="bg-white flex items-center justify-between border-b"
          style={{ background: '#fff', padding: '0 12px' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isMobile && (
              <Button type="text" icon={<MenuIcon size={20} />} onClick={() => setDrawerOpen(true)} />
            )}
            <span className="font-semibold text-gray-700 truncate">{menuTitle(current)}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Xem trang: ẩn chữ trên mobile, chỉ còn icon */}
            <a
              href="/"
              target="_blank"
              className="text-gray-500 hover:text-brand flex items-center gap-1 text-sm"
              title="Xem trang web"
            >
              <ExternalLink size={18} />
              <span className="hidden md:inline">Xem trang</span>
            </a>
            <span className="hidden sm:inline text-sm text-gray-500 truncate max-w-[120px]">
              {user.fullName || 'Admin'}
            </span>
            <Button icon={<LogOut size={16} />} onClick={logout} size="small">
              <span className="hidden sm:inline">Thoát</span>
            </Button>
          </div>
        </Header>

        <Content className="p-3 sm:p-4 md:p-6 bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

function menuTitle(k: string) {
  return { dashboard: 'Tổng quan', media: 'Quản lý nội dung', users: 'Người dùng', settings: 'Cài đặt' }[k] || ''
}
