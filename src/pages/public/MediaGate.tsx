import { useState, useEffect, useRef } from 'react'
import { publicApi } from '../../api'
import type { MediaItem, GalleryItem } from '../../types'
import { Lock, Eye, CheckCircle2 } from 'lucide-react'
import { markUnlocked, isUnlocked } from '../../utils/unlockStore'

// Phần "cổng khoá + nút mở khoá xem" — dùng chung cho modal (trang chủ) và trang chia sẻ /m/:id
export default function MediaGate({
  item,
  lockMessage,
  buttonText,
}: {
  item: MediaItem
  lockMessage?: string
  buttonText?: string
}) {
  const [unlocked, setUnlocked] = useState(false)
  const [items, setItems] = useState<GalleryItem[]>([])
  const unlockedRef = useRef(false) // để listener đọc trạng thái mới nhất (tránh closure cũ)

  const viewLabel = buttonText || 'Bấm vào đây để xem'
  const multi = (item.affiliateLinks || []).length > 1

  // Lấy nội dung đầy đủ để hiển thị. restore=true → tự mở lại (không tăng bộ đếm).
  const reveal = async (restore: boolean) => {
    if (unlockedRef.current) return
    try {
      const res = await publicApi.unlock(item._id, restore)
      const gallery: GalleryItem[] = res.media.items?.length
        ? res.media.items
        : res.media.mediaUrl
        ? [{ type: res.media.type, url: res.media.mediaUrl }]
        : []
      setItems(gallery)
      unlockedRef.current = true
      setUnlocked(true)
    } catch {
      /* bỏ qua */
    }
  }

  // Tự hiện nội dung nếu đã mở khoá trong 10 phút — chạy khi:
  //   • vào trang, • quay lại từ bfcache (bấm Back trên Zalo/FB), • tab hiện lại.
  useEffect(() => {
    const check = () => {
      if (!unlockedRef.current && isUnlocked(item._id)) reveal(true)
    }
    check()
    const onPageShow = () => check()
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    window.addEventListener('pageshow', onPageShow)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('pageshow', onPageShow)
      document.removeEventListener('visibilitychange', onVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item._id])

  // Khi bấm ổ khoá / nút ưu đãi: đánh dấu đã mở + thử hiện ngay.
  // KHÔNG tự điều hướng — để thẻ <a target="_blank"> mở link ở ngữ cảnh mới,
  // nhờ đó trang /m/:id ĐỨNG YÊN (không làm bẩn lịch sử → không kẹt nút Back trên FB/Zalo).
  const onUnlockClick = () => {
    markUnlocked(item._id)
    reveal(false)
  }

  const hasLinks = (item.affiliateLinks || []).length > 0

  return (
    <>
      {/* Vùng media */}
      <div className="relative bg-black">
        {unlocked ? (
          <div className="bg-black">
            {items.map((m, i) => (
              <div key={i} className="relative">
                {items.length > 1 && (
                  <span className="absolute top-2 right-2 z-10 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    {i + 1}/{items.length}
                  </span>
                )}
                {m.type === 'video' ? (
                  <video src={m.url} controls className="w-full max-h-[70vh] bg-black" />
                ) : (
                  <img src={m.url} alt={`${item.title} ${i + 1}`} className="w-full object-contain bg-black" />
                )}
              </div>
            ))}
          </div>
        ) : (
          // ⭐ Bấm thẳng vào vùng khoá (ảnh mờ + ổ khoá) để mở link — dùng thẻ <a> mở ngữ cảnh mới
          <a
            href={hasLinks ? publicApi.goUrl(item._id, 0) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onUnlockClick}
            className="relative block cursor-pointer select-none"
          >
            {item.thumbnailUrl ? (
              <img src={item.thumbnailUrl} className="w-full max-h-[55vh] object-cover locked-blur" />
            ) : (
              <div className="w-full h-72 grid place-items-center text-6xl locked-blur bg-gray-800">
                {item.type === 'video' ? '🎬' : '🖼️'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 grid place-items-center text-white text-center px-6">
              <div>
                <div className="w-16 h-16 mx-auto rounded-full bg-white/15 grid place-items-center mb-3 transition hover:bg-white/25">
                  <Lock size={30} />
                </div>
                <p className="font-semibold">Nội dung đang bị khoá</p>
                <p className="text-white/80 text-sm mt-1">{lockMessage || 'Bấm vào đây để mở khoá xem 👆'}</p>
              </div>
            </div>
          </a>
        )}
      </div>

      {/* Mô tả */}
      {item.description && <p className="px-4 pt-3 text-sm text-gray-600 whitespace-pre-wrap">{item.description}</p>}

      {/* Nút mở khoá */}
      <div className="p-4 space-y-2">
        {unlocked ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-3 py-2 text-sm">
            <CheckCircle2 size={18} /> Đã mở khoá! Chúc bạn xem vui vẻ 💚
          </div>
        ) : (
          !multi && <p className="text-xs text-gray-500 mb-1 text-center">Bấm nút bên dưới để mở khoá xem nội dung</p>
        )}

        {(item.affiliateLinks || []).map((link) => (
          <a
            key={link.index}
            href={publicApi.goUrl(item._id, link.index!)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onUnlockClick}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold py-3.5 rounded-xl transition text-base"
          >
            <Eye size={20} />
            {viewLabel}
            {multi && <span className="opacity-80 font-normal text-sm">({link.label})</span>}
          </a>
        ))}

        {(!item.affiliateLinks || item.affiliateLinks.length === 0) && (
          <p className="text-center text-sm text-gray-400 py-2">Chưa có link cho nội dung này.</p>
        )}
      </div>
    </>
  )
}
