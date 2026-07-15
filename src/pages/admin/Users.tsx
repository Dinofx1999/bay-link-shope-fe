import { useEffect, useState } from 'react'
import { Table, Button, Tag, Space, Popconfirm, message, Modal, Form, Input, Select, Switch, InputNumber } from 'antd'
import { Plus, Pencil, Trash2, KeyRound } from 'lucide-react'
import { usersApi } from '../../api'
import type { User } from '../../types'
import { formatVND } from '../../utils/format'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form] = Form.useForm()
  const me = JSON.parse(localStorage.getItem('aff_user') || '{}')

  const load = async () => {
    setLoading(true)
    try {
      const r = await usersApi.list()
      setUsers(r.users || [])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const openAdd = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ role: 'User', isActive: true, payPerPost: 0 })
    setOpen(true)
  }
  const openEdit = (u: User) => {
    setEditing(u)
    form.setFieldsValue({ ...u, password: '' })
    setOpen(true)
  }

  const submit = async () => {
    const v = await form.validateFields()
    try {
      if (editing) await usersApi.update(editing._id, v)
      else await usersApi.create(v)
      message.success('Đã lưu')
      setOpen(false)
      load()
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Lưu thất bại')
    }
  }

  const remove = async (u: User) => {
    try {
      await usersApi.remove(u._id)
      message.success('Đã xoá')
      load()
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Xoá thất bại')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">Cộng tác viên & quản trị</h2>
        <Button type="primary" icon={<Plus size={16} />} onClick={openAdd}>
          Thêm người dùng
        </Button>
      </div>

      <Table
        rowKey="_id"
        loading={loading}
        dataSource={users}
        scroll={{ x: 700 }}
        columns={[
          {
            title: 'Họ tên',
            render: (_, u) => (
              <div>
                <div className="font-medium">{u.fullName}</div>
                <div className="text-xs text-gray-400">@{u.username}</div>
              </div>
            ),
          },
          {
            title: 'Vai trò',
            dataIndex: 'role',
            width: 100,
            render: (r) => (r === 'Admin' ? <Tag color="red">Admin</Tag> : <Tag color="blue">Cộng tác viên</Tag>),
          },
          { title: 'Bài', dataIndex: 'posts', width: 70 },
          { title: 'Lượt xem', dataIndex: 'views', width: 90 },
          { title: 'Lương/bài', dataIndex: 'payPerPost', width: 110, render: (v) => (v ? formatVND(v) : '—') },
          { title: 'Lương ước tính', dataIndex: 'earnings', width: 130, render: (v) => <b className="text-brand">{formatVND(v)}</b> },
          {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            width: 90,
            render: (a) => (a ? <Tag color="green">Hoạt động</Tag> : <Tag>Khoá</Tag>),
          },
          {
            title: '',
            width: 100,
            render: (_, u) => (
              <Space>
                <Button size="small" icon={<Pencil size={14} />} onClick={() => openEdit(u)} />
                {u._id !== me.id && (
                  <Popconfirm title="Xoá người dùng này?" onConfirm={() => remove(u)} okText="Xoá" cancelText="Huỷ">
                    <Button size="small" danger icon={<Trash2 size={14} />} />
                  </Popconfirm>
                )}
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? 'Sửa người dùng' : 'Thêm người dùng'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        okText="Lưu"
        cancelText="Huỷ"
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-2">
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          {!editing && (
            <Form.Item name="username" label="Tài khoản đăng nhập" rules={[{ required: true, message: 'Nhập tài khoản' }]}>
              <Input placeholder="ctv1" autoComplete="off" />
            </Form.Item>
          )}
          <Form.Item
            name="password"
            label={editing ? 'Đổi mật khẩu (để trống nếu không đổi)' : 'Mật khẩu'}
            rules={editing ? [] : [{ required: true, min: 6, message: 'Tối thiểu 6 ký tự' }]}
          >
            <Input.Password prefix={<KeyRound size={14} />} placeholder="••••••" autoComplete="new-password" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="role" label="Vai trò">
              <Select
                options={[
                  { value: 'User', label: 'Cộng tác viên' },
                  { value: 'Admin', label: 'Admin' },
                ]}
              />
            </Form.Item>
            <Form.Item name="payPerPost" label="Lương/bài (đồng)" tooltip="0 = dùng công thức lương chung ở Cài đặt">
              <InputNumber<number> min={0} step={1000} className="!w-full" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} parser={(v) => Number((v || '').replace(/\./g, '')) || 0} />
            </Form.Item>
          </div>
          <Form.Item name="note" label="Ghi chú">
            <Input placeholder="VD: phụ trách mảng làm đẹp" />
          </Form.Item>
          {editing && (
            <Form.Item name="isActive" label="Cho phép đăng nhập" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}
