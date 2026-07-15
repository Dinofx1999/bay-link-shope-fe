import { useEffect, useState } from 'react'
import { Card, Form, Input, Button, message, Divider, ColorPicker, Space } from 'antd'
import { configApi, authApi } from '../../api'
import { applyTheme } from '../../utils/theme'

const PRESET_COLORS = ['#ee4d2d', '#1677ff', '#52c41a', '#722ed1', '#eb2f96', '#fa8c16', '#13c2c2', '#f5222d', '#111827']

export default function Settings() {
  const [form] = Form.useForm()
  const [pwForm] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    configApi.get().then((r) => form.setFieldsValue(r.config)).catch(() => {})
  }, [])

  const saveConfig = async () => {
    const v = await form.validateFields()
    // ColorPicker trả về object màu → đổi sang chuỗi hex
    const themeColor =
      typeof v.themeColor === 'string' ? v.themeColor : v.themeColor?.toHexString?.() || '#ee4d2d'
    setLoading(true)
    try {
      await configApi.update({ ...v, themeColor })
      applyTheme(themeColor) // áp màu ngay, không cần tải lại
      message.success('Đã lưu cấu hình')
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Lưu thất bại')
    } finally {
      setLoading(false)
    }
  }

  const changePw = async () => {
    const v = await pwForm.validateFields()
    try {
      await authApi.changePassword(v.oldPassword, v.newPassword)
      message.success('Đã đổi mật khẩu')
      pwForm.resetFields()
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Đổi mật khẩu thất bại')
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card title="Thông tin trang">
        <Form form={form} layout="vertical">
          <Form.Item name="siteName" label="Tên trang">
            <Input />
          </Form.Item>
          <Form.Item name="tagline" label="Khẩu hiệu (tagline)">
            <Input />
          </Form.Item>
          <Form.Item name="logoUrl" label="URL Logo">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="themeColor" label="Màu trang web" tooltip="Màu chủ đạo cho header, nút, điểm nhấn">
            <ColorPicker format="hex" showText presets={[{ label: 'Gợi ý', colors: PRESET_COLORS }]} />
          </Form.Item>
          <Space wrap className="mb-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => form.setFieldValue('themeColor', c)}
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ background: c }}
                title={c}
              />
            ))}
          </Space>
          <Form.Item name="lockMessage" label="Thông điệp ở lớp khoá">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="unlockButtonText"
            label="Chữ trên nút mở khoá"
            tooltip="VD: Bấm vào đây để xem. Nút vẫn điều hướng qua link affiliate phía sau."
          >
            <Input placeholder="Bấm vào đây để xem" />
          </Form.Item>

          <Divider orientation="left" className="!text-sm">Liên hệ / Mạng xã hội</Divider>
          <Form.Item name={['contact', 'facebook']} label="Facebook">
            <Input placeholder="https://facebook.com/..." />
          </Form.Item>
          <Form.Item name={['contact', 'tiktok']} label="TikTok">
            <Input placeholder="https://tiktok.com/@..." />
          </Form.Item>
          <Form.Item name={['contact', 'zalo']} label="Zalo">
            <Input placeholder="https://zalo.me/..." />
          </Form.Item>

          <Button type="primary" loading={loading} onClick={saveConfig}>
            Lưu cấu hình
          </Button>
        </Form>
      </Card>

      <Card title="Đổi mật khẩu">
        <Form form={pwForm} layout="vertical">
          <Form.Item name="oldPassword" label="Mật khẩu hiện tại" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[{ required: true, min: 6, message: 'Tối thiểu 6 ký tự' }]}
          >
            <Input.Password />
          </Form.Item>
          <Button onClick={changePw}>Đổi mật khẩu</Button>
        </Form>
      </Card>
    </div>
  )
}
