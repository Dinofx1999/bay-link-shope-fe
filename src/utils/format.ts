// Định dạng số tiền VND: 15000 -> "15.000 đ"
export function formatVND(n?: number) {
  const v = Number(n) || 0
  return v.toLocaleString('vi-VN') + ' đ'
}
