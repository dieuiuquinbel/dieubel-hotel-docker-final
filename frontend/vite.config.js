import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cấu hình dev server cho frontend.
// Không khóa cứng port để tránh lỗi khi Vite cũ vẫn còn chạy trên máy.
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5714,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
