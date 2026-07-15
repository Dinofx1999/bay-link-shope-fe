import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { message, Spin } from 'antd'
import { ArrowLeft, Share2, Eye, Lock } from 'lucide-react'
import { publicApi } from '../../api'
import type { MediaItem, SiteConfig } from '../../types'
import MediaGate from './MediaGate'
import { shareContent } from '../../utils/share'
import { applyTheme } from '../../utils/theme'

export default function MediaPage() {
  const { id = '' } = useParams()
  const [item, setItem] = useState<MediaItem | null>(null)
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    publicApi.site().then((r) => {
      setConfig(r.config)
      applyTheme(r.config?.themeColor)
    }).catch(() => {})

    publicApi
      .detail(id)
      .then((r) => {
        setItem(r.item)
        document.title = r.item.title
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const onShare = async () => {
    if (!item) return
    const r = await shareContent(item._id, item.title)
    if (r === 'copied') message.success('Đã copy link chia sẻ!')
  }

  if (loading)
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <Spin size="large" />
      </div>
    )

  if (notFound || !item)
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 px-4 text-center">
        <div>
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-600 font-semibold">Nội dung không tồn tại hoặc đã bị ẩn</p>
          <Link to="/" className="text-brand font-medium mt-3 inline-block">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Thanh trên cùng */}
      <header className="bg-gradient-to-r from-brand to-brand-dark text-white">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <ArrowLeft size={20} />
            <span className="line-clamp-1">{config?.siteName || 'Affiliate Hub'}</span>
          </Link>
          <button onClick={onShare} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-medium">
            <Share2 size={16} /> Chia sẻ
          </button>
        </div>
      </header>

      {/* Nội dung */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3 py-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border">
          <div className="px-4 pt-3">
            <h1 className="font-bold text-lg text-gray-800">{item.title}</h1>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Eye size={13} /> {item.views}</span>
              <span className="flex items-center gap-1"><Lock size={13} /> {item.unlocks} mở khoá</span>
              {item.tags?.length > 0 && <span>{item.tags.map((t) => `#${t}`).join(' ')}</span>}
            </div>
          </div>
          <div className="mt-2">
            <MediaGate item={item} lockMessage={config?.lockMessage} buttonText={config?.unlockButtonText} />
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="text-brand font-medium text-sm">← Xem thêm nội dung khác</Link>
        </div>
      </main>
    </div>
  )
}
