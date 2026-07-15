import { useState } from 'react'
import { publicApi } from '../../api'
import type { MediaItem } from '../../types'
import { Lock, Eye, CheckCircle2 } from 'lucide-react'

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
  const [mediaUrl, setMediaUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const viewLabel = buttonText || 'Bấm vào đây để xem'
  const multi = (item.affiliateLinks || []).length > 1

  // Bấm vào ưu đãi → mở link affiliate (tab mới, qua cổng /go ghi log) + mở khoá nội dung
  const handleUnlock = async (index: number) => {
    window.open(publicApi.goUrl(item._id, index), '_blank', 'noopener')
    setLoading(true)
    try {
      const res = await publicApi.unlock(item._id)
      setMediaUrl(res.media.mediaUrl)
      setUnlocked(true)
    } catch {
      /* vẫn mở link affiliate dù unlock lỗi */
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Vùng media */}
      <div className="relative bg-black">
        {unlocked ? (
          item.type === 'video' ? (
            <video src={mediaUrl} controls autoPlay className="w-full max-h-[60vh]" />
          ) : (
            <img src={mediaUrl} alt={item.title} className="w-full max-h-[60vh] object-contain" />
          )
        ) : (
          <div className="relative">
            {item.thumbnailUrl ? (
              <img src={item.thumbnailUrl} className="w-full max-h-[55vh] object-cover locked-blur" />
            ) : (
              <div className="w-full h-72 grid place-items-center text-6xl locked-blur bg-gray-800">
                {item.type === 'video' ? '🎬' : '🖼️'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 grid place-items-center text-white text-center px-6">
              <div>
                <div className="w-16 h-16 mx-auto rounded-full bg-white/15 grid place-items-center mb-3">
                  <Lock size={30} />
                </div>
                <p className="font-semibold">Nội dung đang bị khoá</p>
                <p className="text-white/80 text-sm mt-1">{lockMessage || 'Bấm nút bên dưới để mở khoá 👇'}</p>
              </div>
            </div>
          </div>
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
          <button
            key={link.index}
            disabled={loading}
            onClick={() => handleUnlock(link.index!)}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition text-base"
          >
            <Eye size={20} />
            {viewLabel}
            {multi && <span className="opacity-80 font-normal text-sm">({link.label})</span>}
          </button>
        ))}

        {(!item.affiliateLinks || item.affiliateLinks.length === 0) && (
          <p className="text-center text-sm text-gray-400 py-2">Chưa có link cho nội dung này.</p>
        )}
      </div>
    </>
  )
}
