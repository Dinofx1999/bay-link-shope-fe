import { useEffect, useState } from 'react'
import { message } from 'antd'
import { publicApi } from '../../api'
import type { MediaItem } from '../../types'
import { X, Share2 } from 'lucide-react'
import MediaGate from './MediaGate'
import { shareContent } from '../../utils/share'

export default function UnlockModal({
  item,
  lockMessage,
  buttonText,
  onClose,
}: {
  item: MediaItem
  lockMessage?: string
  buttonText?: string
  onClose: () => void
}) {
  // Lấy chi tiết (kèm nội dung media) + ghi nhận lượt xem
  const [full, setFull] = useState<MediaItem>(item)
  useEffect(() => {
    publicApi.detail(item._id).then((r) => setFull(r.item)).catch(() => {})
  }, [item._id])

  const onShare = async () => {
    const r = await shareContent(item._id, item.title)
    if (r === 'copied') message.success('Đã copy link chia sẻ!')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-bold text-gray-800 pr-2 line-clamp-1">{item.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onShare}
              title="Chia sẻ"
              className="text-gray-400 hover:text-brand p-1 rounded-lg hover:bg-gray-100"
            >
              <Share2 size={20} />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
              <X size={22} />
            </button>
          </div>
        </div>

        <MediaGate item={full} lockMessage={lockMessage} buttonText={buttonText} />
      </div>
    </div>
  )
}
