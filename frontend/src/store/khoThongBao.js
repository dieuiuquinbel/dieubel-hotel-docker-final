// Chức năng: Store Zustand quản lý toast thông báo.
import { create } from 'zustand';

const useKhoThongBao = create((set) => ({
  toasts: [],
  hienThongBao: (message, tone = 'success') => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, tone }],
    }));

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, 4000);
  },
  xoaThongBao: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export default useKhoThongBao;
