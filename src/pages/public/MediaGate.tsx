import { useState, useEffect } from 'react'
import { publicApi } from '../../api'
import type { MediaItem, GalleryItem } from '../../types'
import { Lock, Eye } from 'lucide-react'
import { markUnlocked, isUnlocked } from '../../utils/unlockStore'

// KHOÁ CỨNG: bắt buộc bấm link affiliate mới xem được.
// Mấu chốt để chạy được trên Facebook iOS: bấm THẲNG vào link Shopee gốc (universal link)
// → iOS mở app Shopee mà KHÔNG rời trang → quay lại là thấy nội dung. Log click gửi ngầm bằng beacon.
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
  const multi = links.length > 1

  // Đã bấm link & mở trong 10 phút gần đây → hiện luôn khi quay lại
  useEffect(() => {
    if (isUnlocked(item._id)) setRevealed(true)
  }, [item._id])

  // Bấm link: ghi log ngầm + đánh dấu đã mở + hiện nội dung. Thẻ <a> lo việc mở Shopee.
  const onUnlock = (index: number) => {
    publicApi.logClick(item._id, index)
    markUnlocked(item._id)
    setRevealed(true)
    publicApi.unlock(item._id, false).catch(() => {}) // đếm lượt mở
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
          // Ảnh mờ + overlay — BẤM THẲNG vào link Shopee gốc (universal link mở app, không rời trang)
          <a
            href={links[0]?.url || undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => links[0] && onUnlock(0)}
            className="relative block cursor-pointer select-none"
          >
            {cover ? (
              <img src={cover} className="w-full max-h-[55vh] object-cover locked-blur" />
            ) : (
              <div className="w-full h-72 grid place-items-center text-6xl locked-blur bg-gray-800">
                {gallery[0]?.type === 'video' ? '🎬' : '🖼️'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 grid place-items-center text-white text-center px-6">
              <div>
                <div className="w-16 h-16 mx-auto rounded-full bg-brand grid place-items-center mb-3 shadow-lg animate-pulse">
                  <Lock size={28} />
                </div>
                <p className="font-bold text-lg">Nội dung đang bị khoá</p>
                <p className="text-white/85 text-sm mt-1">{lockMessage || 'Bấm vào đây để mở khoá xem 👆'}</p>
              </div>
            </div>
          </a>
        )}
      </div>

      {/* Mô tả */}
      {item.description && <p className="px-4 pt-3 text-sm text-gray-600 whitespace-pre-wrap">{item.description}</p>}

      {/* Nút mở khoá */}
      <div className="p-4 space-y-2">
        {revealed ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-3 py-2 text-sm">
            <Eye size={18} /> Đang xem nội dung — cảm ơn bạn đã ủng hộ 💚
          </div>
        ) : (
          <>
            {!multi && <p className="text-xs text-gray-500 mb-1 text-center">Bấm nút bên dưới để mở khoá xem nội dung</p>}
            {links.map((link) => (
              <a
                key={link.index}
                href={link.url || undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onUnlock(link.index!)}
                className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold py-3.5 rounded-xl transition text-base"
              >
                <Eye size={20} />
                {viewLabel}
                {multi && <span className="opacity-80 font-normal text-sm">({link.label})</span>}
              </a>
            ))}
            {links.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-2">Chưa có link cho nội dung này.</p>
            )}
          </>
        )}
      </div>
    </>
  )
}
