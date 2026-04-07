import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('bkbb_user') || 'null'),
  token: localStorage.getItem('bkbb_token') || null,
  isLoading: false,

  setAuth: (user, token) => {
    localStorage.setItem('bkbb_token', token);
    localStorage.setItem('bkbb_user', JSON.stringify(user));
    set({ user, token });
  },

  updateUser: (user) => {
    localStorage.setItem('bkbb_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('bkbb_token');
    localStorage.removeItem('bkbb_user');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!localStorage.getItem('bkbb_token'),
}));

export default useAuthStore;
