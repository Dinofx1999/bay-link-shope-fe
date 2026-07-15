import { useEffect, useState } from 'react'
import { Card, Row, Col, Table, Statistic, Spin } from 'antd'
import { Eye, Lock, MousePointerClick, Film } from 'lucide-react'
import { statsApi } from '../../api'
import type { Overview } from '../../types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState<Overview | null>(null)
  const [chart, setChart] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([statsApi.overview(), statsApi.clicks(14)])
      .then(([o, c]) => {
        setStats(o.stats)
        setChart(c.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="grid place-items-center py-20"><Spin size="large" /></div>

  const cards = [
    { title: 'Nội dung', value: stats?.totalMedia, sub: `${stats?.published} đang hiển thị`, icon: <Film />, color: '#ee4d2d' },
    { title: 'Lượt xem', value: stats?.totalViews, icon: <Eye />, color: '#1677ff' },
    { title: 'Lượt mở khoá', value: stats?.totalUnlocks, icon: <Lock />, color: '#52c41a' },
    { title: 'Click affiliate', value: stats?.totalClicks, icon: <MousePointerClick />, color: '#722ed1' },
  ]

  return (
    <div className="space-y-4">
      <Row gutter={[16, 16]}>
        {cards.map((c) => (
          <Col xs={12} md={6} key={c.title}>
            <Card>
              <div className="flex items-center justify-between">
                <Statistic title={c.title} value={c.value ?? 0} />
                <div style={{ color: c.color }}>{c.icon}</div>
              </div>
              {c.sub && <div className="text-xs text-gray-400 mt-1">{c.sub}</div>}
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Lượt click affiliate (14 ngày)">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={11} />
            <YAxis allowDecimals={false} fontSize={11} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#ee4d2d" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Top nội dung hút click">
        <Table
          rowKey="_id"
          pagination={false}
          scroll={{ x: 'max-content' }}
          dataSource={stats?.topMedia || []}
          columns={[
            { title: 'Tiêu đề', dataIndex: 'title' },
            { title: 'Loại', dataIndex: 'type', width: 90, render: (t) => (t === 'video' ? '🎬 Video' : '🖼️ Ảnh') },
            { title: 'Xem', dataIndex: 'views', width: 80 },
            { title: 'Mở khoá', dataIndex: 'unlocks', width: 90 },
            { title: 'Click', dataIndex: 'clicks', width: 80 },
          ]}
        />
      </Card>
    </div>
  )
}
