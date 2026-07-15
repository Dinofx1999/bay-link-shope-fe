/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Màu chủ đạo lấy từ CSS variable → đổi được lúc chạy theo cấu hình admin
        brand: {
          DEFAULT: 'var(--brand)',
          dark: 'var(--brand-dark)',
        },
      },
    },
  },
  plugins: [],
}
