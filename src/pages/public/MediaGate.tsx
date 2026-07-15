import { useState, useEffect } from 'react'
import { publicApi } from '../../api'
import type { MediaItem, GalleryItem } from '../../types'
import { Eye, CheckCircle2 } from 'lucide-react'
import { markUnlocked, isUnlocked } from '../../utils/unlockStore'

// "Cổng affiliate mềm": nội dung tải sẵn nhưng để MỜ; bấm → mở link affiliate (tab mới, ghi log)
// đồng thời BỎ MỜ NGAY tại chỗ. Không cần quay lại → hết lỗi trên webview FB/Zalo.
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
  const multi = (item.affiliateLinks || []).length > 1
  const hasLinks = (item.affiliateLinks || []).length > 0

  // Đã mở trong 10 phút gần đây → hiện luôn, khỏi bấm
  useEffect(() => {
    if (isUnlocked(item._id)) setRevealed(true)
  }, [item._id])

  // Bấm ưu đãi: đánh dấu + hiện NGAY (dữ liệu đã có sẵn) + đếm lượt. Thẻ <a> lo việc mở Shopee.
  const onReveal = () => {
    markUnlocked(item._id)
    setRevealed(true)
    publicApi.unlock(item._id, false).catch(() => {}) // đếm lượt mở (không chặn)
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
          // Ảnh bìa MỜ + overlay dụ bấm — là thẻ <a> mở affiliate ở ngữ cảnh mới
          <a
            href={hasLinks ? publicApi.goUrl(item._id, 0) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onReveal}
            className="relative block cursor-pointer select-none"
          >
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
                <p className="text-white/80 text-sm mt-1">{lockMessage || 'Bấm để xem nội dung đầy đủ 👆'}</p>
              </div>
            </div>
          </a>
        )}
      </div>

      {/* Mô tả */}
      {item.description && <p className="px-4 pt-3 text-sm text-gray-600 whitespace-pre-wrap">{item.description}</p>}

      {/* Nút bên dưới */}
      <div className="p-4 space-y-2">
        {revealed ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-3 py-2 text-sm">
            <CheckCircle2 size={18} /> Đang xem nội dung — chúc bạn vui vẻ 💚
          </div>
        ) : (
          <>
            {!multi && <p className="text-xs text-gray-500 mb-1 text-center">Bấm nút bên dưới để xem nội dung</p>}
            {(item.affiliateLinks || []).map((link) => (
              <a
                key={link.index}
                href={publicApi.goUrl(item._id, link.index!)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onReveal}
                className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold py-3.5 rounded-xl transition text-base"
              >
                <Eye size={20} />
                {viewLabel}
                {multi && <span className="opacity-80 font-normal text-sm">({link.label})</span>}
              </a>
            ))}
            {!hasLinks && (
              <button
                onClick={onReveal}
                className="w-full flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3.5 rounded-xl text-base"
              >
                <Eye size={20} /> {viewLabel}
              </button>
            )}
          </>
        )}
      </div>
    </>
  )
}
