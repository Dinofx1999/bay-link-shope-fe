// Lưu trạng thái "đã mở khoá" của từng nội dung vào localStorage, hạn 10 phút.
// Nhờ đó khách bấm qua link affiliate (kể cả Zalo điều hướng đi) → quay lại tự mở, khỏi click lại.

const PREFIX = 'aff_unlock_'
const TTL = 10 * 60 * 1000 // 10 phút

export function markUnlocked(id: string) {
  try {
    localStorage.setItem(PREFIX + id, String(Date.now()))
  } catch {
    /* localStorage có thể bị chặn ở chế độ ẩn danh — bỏ qua */
  }
}

export function isUnlocked(id: string): boolean {
  try {
    const t = Number(localStorage.getItem(PREFIX + id) || 0)
    if (!t) return false
    if (Date.now() - t > TTL) {
      localStorage.removeItem(PREFIX + id)
      return false
    }
    return true
  } catch {
    return false
  }
}
