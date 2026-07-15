// Lưu trạng thái "đã mở khoá" của từng nội dung vào localStorage, hạn 10 phút.
// ⭐ TẠM TẮT để dễ test (mỗi lần tải là trạng thái mờ ban đầu). Bật lại: ENABLED = true.
const ENABLED = false

const PREFIX = 'aff_unlock_'
const TTL = 10 * 60 * 1000 // 10 phút

export function markUnlocked(id: string) {
  if (!ENABLED) return
  try {
    localStorage.setItem(PREFIX + id, String(Date.now()))
  } catch {
    /* localStorage có thể bị chặn ở chế độ ẩn danh — bỏ qua */
  }
}

export function isUnlocked(id: string): boolean {
  if (!ENABLED) return false
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
