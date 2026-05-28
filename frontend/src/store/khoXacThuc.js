// Chức năng: Store Zustand lưu phiên đăng nhập và user.
// Kho trang thai dang nhap: luu user/token va phuc hoi phien bang localStorage.
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const useKhoXacThuc = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthReady: false,
      setSession: ({ token, user }) =>
        set({
          token,
          user,
          isAuthReady: true,
        }),
      setUser: (user) =>
        set({
          user,
        }),
      clearSession: () =>
        set({
          token: null,
          user: null,
          isAuthReady: true,
        }),
      markReady: () =>
        set({
          isAuthReady: true,
        }),
      markPending: () =>
        set({
          isAuthReady: false,
        }),
    }),
    {
      name: 'staynest-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

export default useKhoXacThuc;
