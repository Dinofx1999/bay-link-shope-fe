import { useEffect, useState } from 'react'
import { Button, Table, Input, Tag, Space, Popconfirm, message, Image, Switch, Tooltip } from 'antd'
import { Plus, Pencil, Trash2, Search, Share2 } from 'lucide-react'
import { mediaApi } from '../../api'
import type { MediaItem } from '../../types'
import MediaForm from './MediaForm'
import { shareUrl, copyLink } from '../../utils/share'
import { formatVND } from '../../utils/format'

const isAdmin = () => JSON.parse(localStorage.getItem('aff_user') || '{}').role === 'Admin'

export default function MediaList() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<MediaItem | null>(null)
  const [open, setOpen] = useState(false)

  const load = async (search = q) => {
    setLoading(true)
    try {
      const res = await mediaApi.list({ q: search, limit: 100 })
      setItems(res.items || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load('')
  }, [])

  const onDelete = async (id: string) => {
    await mediaApi.remove(id)
    message.success('Đã xoá')
    load()
  }

  const togglePublish = async (item: MediaItem) => {
    await mediaApi.update(item._id, { isPublished: !item.isPublished })
    load()
  }

  const copyShare = async (item: MediaItem) => {
    const ok = await copyLink(item._id)
    if (ok) message.success('Đã copy link: ' + shareUrl(item._id))
    else message.error('Không copy được, hãy copy thủ công: ' + shareUrl(item._id))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onPressEnter={() => load()}
          prefix={<Search size={16} className="text-gray-400" />}
          placeholder="Tìm theo tiêu đề, tag..."
          className="max-w-xs"
          allowClear
        />
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Thêm nội dung
        </Button>
      </div>

      <Table
        rowKey="_id"
        loading={loading}
        dataSource={items}
        scroll={{ x: 800 }}
        columns={[
          {
            title: 'Ảnh',
            width: 70,
            render: (_, r) =>
              r.thumbnailUrl ? (
                <Image src={r.thumbnailUrl} width={48} height={48} className="object-cover rounded" />
              ) : (
                <div className="w-12 h-12 rounded bg-gray-100 grid place-items-center">
                  {r.type === 'video' ? '🎬' : '🖼️'}
                </div>
              ),
          },
          {
            title: 'Tiêu đề',
            dataIndex: 'title',
            render: (t, r) => (
              <div>
                <div className="font-medium">{t}</div>
                <div className="text-xs text-gray-400">{r.tags?.map((x) => `#${x}`).join(' ')}</div>
              </div>
            ),
          },
          ...(isAdmin()
            ? [{ title: 'Tác giả', dataIndex: 'authorName', width: 130, render: (v: string) => v || '—' }]
            : []),
          { title: 'Loại', dataIndex: 'type', width: 90, render: (t) => (t === 'video' ? <Tag color="red">Video</Tag> : <Tag color="blue">Ảnh</Tag>) },
          { title: 'Link', width: 70, render: (_, r) => <Tag>{r.affiliateLinks?.length || 0}</Tag> },
          { title: 'Xem', dataIndex: 'views', width: 70 },
          { title: 'Mở khoá', dataIndex: 'unlocks', width: 90 },
          { title: 'Lương', dataIndex: 'earnings', width: 110, render: (v: number) => <b className="text-brand">{formatVND(v)}</b> },
          {
            title: 'Hiển thị',
            width: 90,
            render: (_, r) => <Switch checked={r.isPublished} onChange={() => togglePublish(r)} size="small" />,
          },
          {
            title: '',
            width: 140,
            render: (_, r) => (
              <Space>
                <Tooltip title="Copy link chia sẻ">
                  <Button size="small" icon={<Share2 size={14} />} onClick={() => copyShare(r)} />
                </Tooltip>
                <Button
                  size="small"
                  icon={<Pencil size={14} />}
                  onClick={() => {
                    setEditing(r)
                    setOpen(true)
                  }}
                />
                <Popconfirm title="Xoá nội dung này?" onConfirm={() => onDelete(r._id)} okText="Xoá" cancelText="Huỷ">
                  <Button size="small" danger icon={<Trash2 size={14} />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <MediaForm
        open={open}
        item={editing}
        onClose={() => setOpen(false)}
        onSaved={() => {
          setOpen(false)
          load()
        }}
      />
    </div>
  )
}
