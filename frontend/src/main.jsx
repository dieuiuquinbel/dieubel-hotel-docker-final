// Chức năng: Khởi tạo React app, router và React Query provider.
// Điểm vào của frontend.
// File này gắn React vào DOM, cấu hình React Query và bọc Router cho toàn bộ ứng dụng.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import UngDung from './app/UngDung';
import './index.css';

const trinhQuanLyTruyVan = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={trinhQuanLyTruyVan}>
      <BrowserRouter>
        <UngDung />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
