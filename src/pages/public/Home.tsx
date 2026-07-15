import { useEffect, useState, useCallback } from 'react'
import { publicApi } from '../../api'
import type { MediaItem, SiteConfig } from '../../types'
import { Lock, Play, Search, Eye, Flame, ExternalLink } from 'lucide-react'
import UnlockModal from './UnlockModal'

export default function Home() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [active, setActive] = useState<MediaItem | null>(null)

  const load = useCallback(async (search = '') => {
    setLoading(true)
    try {
      const res = await publicApi.list({ q: search, limit: 48 })
      setItems(res.items || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    publicApi.site().then((r) => setConfig(r.config)).catch(() => {})
    load()
  }, [load])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand to-brand-dark text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt="logo" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-white/20 grid place-items-center text-2xl">🔥</div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">{config?.siteName || 'Affiliate Hub'}</h1>
              <p className="text-white/90 text-sm md:text-base">{config?.tagline}</p>
            </div>
          </div>

          {/* Tìm kiếm */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              load(q)
            }}
            className="mt-6 flex gap-2 max-w-xl"
          >
            <div className="flex-1 flex items-center bg-white rounded-lg px-3">
              <Search size={18} className="text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm clip, ảnh, sản phẩm..."
                className="flex-1 px-2 py-2.5 outline-none text-gray-800"
              />
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-5 rounded-lg font-semibold">Tìm</button>
          </form>
        </div>
      </header>

      {/* Lưới nội dung */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Flame size={48} className="mx-auto mb-3 opacity-40" />
            <p>Chưa có nội dung nào. Hãy quay lại sau nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <Card key={item._id} item={item} onOpen={() => setActive(item)} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500 flex flex-wrap gap-4 justify-between">
          <span>© {new Date().getFullYear()} {config?.siteName || 'Affiliate Hub'}</span>
          <div className="flex gap-4">
            {config?.contact?.facebook && <a href={config.contact.facebook} target="_blank" className="hover:text-brand">Facebook</a>}
            {config?.contact?.tiktok && <a href={config.contact.tiktok} target="_blank" className="hover:text-brand">TikTok</a>}
            {config?.contact?.zalo && <a href={config.contact.zalo} target="_blank" className="hover:text-brand">Zalo</a>}
          </div>
        </div>
      </footer>

      {active && (
        <UnlockModal
          item={active}
          lockMessage={config?.lockMessage}
          buttonText={config?.unlockButtonText}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  )
}

function Card({ item, onOpen }: { item: MediaItem; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group text-left bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition border"
    >
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover locked-blur" />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-300 text-5xl locked-blur">
            {item.type === 'video' ? '🎬' : '🖼️'}
          </div>
        )}
        {/* Lớp khoá */}
        <div className="absolute inset-0 bg-black/30 grid place-items-center">
          <div className="bg-white/95 rounded-full w-14 h-14 grid place-items-center shadow-lg group-hover:scale-110 transition">
            {item.type === 'video' ? <Play className="text-brand" /> : <Lock className="text-brand" />}
          </div>
        </div>
        {item.pinned && (
          <span className="absolute top-2 left-2 bg-brand text-white text-[11px] px-2 py-0.5 rounded-full font-semibold">
            HOT
          </span>
        )}
        <span className="absolute top-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
          <ExternalLink size={11} /> Ưu đãi
        </span>
      </div>
      <div className="p-2.5">
        <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug">{item.title}</h3>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1"><Eye size={12} /> {item.views}</span>
          <span className="flex items-center gap-1"><Lock size={12} /> {item.unlocks} mở khoá</span>
        </div>
      </div>
    </button>
  )
}
