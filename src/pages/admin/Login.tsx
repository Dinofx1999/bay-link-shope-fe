import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import { authApi } from '../../api'

export default function AdminLogin() {
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (v: { username: string; password: string }) => {
    setLoading(true)
    try {
      const res = await authApi.login(v.username, v.password)
      localStorage.setItem('aff_token', res.token)
      localStorage.setItem('aff_user', JSON.stringify(res.user))
      message.success('Đăng nhập thành công')
      nav('/admin/dashboard')
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-brand to-brand-dark p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-7">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-xl bg-brand grid place-items-center text-white text-2xl mb-2">🔥</div>
          <h1 className="text-xl font-bold text-gray-800">Affiliate Hub</h1>
          <p className="text-gray-400 text-sm">Trang quản trị</p>
        </div>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ username: 'admin' }}>
          <Form.Item name="username" label="Tài khoản" rules={[{ required: true, message: 'Nhập tài khoản' }]}>
            <Input size="large" placeholder="admin" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
            <Input.Password size="large" placeholder="••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            Đăng nhập
          </Button>
        </Form>
        <p className="text-center text-xs text-gray-400 mt-4">
          Mặc định: admin / admin123 — đổi mật khẩu sau khi đăng nhập.
        </p>
      </div>
    </div>
  )
}
