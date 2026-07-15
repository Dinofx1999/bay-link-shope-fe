// Link chia sẻ riêng cho 1 nội dung
export function shareUrl(id: string) {
  return `${location.origin}/m/${id}`
}

// Chỉ COPY link vào clipboard (không mở hộp chia sẻ của hệ điều hành)
export async function copyLink(id: string): Promise<boolean> {
  const url = shareUrl(id)
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = url
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}

// Chia sẻ: ưu tiên hộp thoại chia sẻ của thiết bị (mobile), không thì copy link
export async function shareContent(id: string, title?: string): Promise<'shared' | 'copied' | 'cancel'> {
  const url = shareUrl(id)
  if (navigator.share) {
    try {
      await navigator.share({ title: title || 'Xem nội dung', url })
      return 'shared'
    } catch {
      return 'cancel'
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    // fallback cũ
    const ta = document.createElement('textarea')
    ta.value = url
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    return 'copied'
  }
}
