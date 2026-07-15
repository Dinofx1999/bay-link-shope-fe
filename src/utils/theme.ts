// Làm tối một màu hex đi `amt` (0..1) — dùng tạo màu hover (brand-dark)
export function darken(hex: string, amt = 0.14): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  if (!m) return hex
  const adj = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 - amt))))
  const r = adj(parseInt(m[1], 16))
  const g = adj(parseInt(m[2], 16))
  const b = adj(parseInt(m[3], 16))
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

// Áp màu chủ đạo lên toàn trang (đặt CSS variable trên <html>)
export function applyTheme(color?: string) {
  const c = color || '#ee4d2d'
  const root = document.documentElement
  root.style.setProperty('--brand', c)
  root.style.setProperty('--brand-dark', darken(c))
}
