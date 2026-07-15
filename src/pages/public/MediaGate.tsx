import { useState, useEffect } from 'react'
import { publicApi } from '../../api'
import type { MediaItem, GalleryItem } from '../../types'
import { Eye, ShoppingBag } from 'lucide-react'
import { markUnlocked, isUnlocked } from '../../utils/unlockStore'

// Tách rời "xem nội dung" và "bấm Shopee":
//  • Bấm ảnh mờ → hiện nội dung NGAY, KHÔNG điều hướng → mượt trên webview Facebook/Zalo.
//  • Nút Shopee riêng bên dưới → mở affiliate (điều hướng đi cũng không ảnh hưởng nội dung).
export default function MediaGate({
  item,
  lockMessage,
  buttonText,
}: {
  item: MediaItem
  lockMessage?: string
  buttonText?: string
}) {
  const gallery: GalleryItem[] = item.media?.length
    ? item.media
    : item.mediaUrl
    ? [{ type: item.type, url: item.mediaUrl }]
    : []

  const [revealed, setRevealed] = useState(false)
  const viewLabel = buttonText || 'Bấm vào đây để xem'
  const links = item.affiliateLinks || []

  useEffect(() => {
    if (isUnlocked(item._id)) setRevealed(true)
  }, [item._id])

  // Hiện nội dung — KHÔNG điều hướng (an toàn trên mọi webview)
  const onReveal = () => {
    markUnlocked(item._id)
    setRevealed(true)
    publicApi.unlock(item._id, false).catch(() => {}) // đếm lượt xem
  }

  const cover = item.thumbnailUrl || (gallery[0]?.type === 'image' ? gallery[0].url : '')

  return (
    <>
      {/* Vùng media */}
      <div className="relative bg-black">
        {revealed ? (
          <div className="bg-black">
            {gallery.map((m, i) => (
              <div key={i} className="relative">
                {gallery.length > 1 && (
                  <span className="absolute top-2 right-2 z-10 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    {i + 1}/{gallery.length}
                  </span>
                )}
                {m.type === 'video' ? (
                  <video src={m.url} controls autoPlay={i === 0} className="w-full max-h-[70vh] bg-black" />
                ) : (
                  <img src={m.url} alt={`${item.title} ${i + 1}`} className="w-full object-contain bg-black" />
                )}
              </div>
            ))}
          </div>
        ) : (
          // Ảnh mờ + overlay — BẤM LÀ HIỆN NGAY (button, không điều hướng)
          <button onClick={onReveal} className="relative block w-full cursor-pointer select-none">
            {cover ? (
              <img src={cover} className="w-full max-h-[55vh] object-cover locked-blur" />
            ) : (
              <div className="w-full h-72 grid place-items-center text-6xl locked-blur bg-gray-800">
                {gallery[0]?.type === 'video' ? '🎬' : '🖼️'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/45 grid place-items-center text-white text-center px-6">
              <div>
                <div className="w-16 h-16 mx-auto rounded-full bg-brand grid place-items-center mb-3 shadow-lg animate-pulse">
                  <Eye size={30} />
                </div>
                <p className="font-bold text-lg">🔥 {viewLabel}</p>
                <p className="text-white/80 text-sm mt-1">{lockMessage || 'Bấm vào ảnh để xem nội dung 👆'}</p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Mô tả */}
      {item.description && <p className="px-4 pt-3 text-sm text-gray-600 whitespace-pre-wrap">{item.description}</p>}

      {/* Nút xem (khi chưa mở) + nút ưu đãi Shopee (luôn hiện) */}
      <div className="p-4 space-y-2">
        {!revealed && (
          <button
            onClick={onReveal}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold py-3.5 rounded-xl transition text-base"
          >
            <Eye size={20} /> {viewLabel}
          </button>
        )}

        {links.length > 0 && (
          <>
            <p className="text-xs text-gray-400 text-center pt-1">🛒 Ưu đãi hot — ủng hộ mình nhé:</p>
            {links.map((link) => (
              <a
                key={link.index}
                href={publicApi.goUrl(item._id, link.index!)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-brand border border-brand/30 font-semibold py-3 rounded-xl transition"
              >
                <ShoppingBag size={18} /> {link.label}
              </a>
            ))}
          </>
        )}
      </div>
    </>
  )
}
