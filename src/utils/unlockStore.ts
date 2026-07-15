// Nhớ trạng thái "đã mở khoá" của từng nội dung. Thời hạn cấu hình được từ Cài đặt.
const ENABLED = true

const PREFIX = 'aff_unlock_'
let ttlMs = 10 * 60 * 1000 // mặc định 10 phút; App cập nhật theo cấu hình site

// Đặt thời hạn nhớ (phút). 0 = tắt nhớ (mỗi lần vào đều phải bấm link).
export function setUnlockTtlMinutes(minutes?: number) {
  const m = Number(minutes)
  ttlMs = Number.isFinite(m) && m >= 0 ? m * 60 * 1000 : 10 * 60 * 1000
}

export function markUnlocked(id: string) {
  if (!ENABLED || ttlMs <= 0) return
  try {
    localStorage.setItem(PREFIX + id, String(Date.now()))
  } catch {
    /* localStorage bị chặn — bỏ qua */
  }
}

export function isUnlocked(id: string): boolean {
  if (!ENABLED || ttlMs <= 0) return false
  try {
    const t = Number(localStorage.getItem(PREFIX + id) || 0)
    if (!t) return false
    if (Date.now() - t > ttlMs) {
      localStorage.removeItem(PREFIX + id)
      return false
    }
    return true
  } catch {
    return false
  }
}
