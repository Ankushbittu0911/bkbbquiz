import { create } from 'zustand';

const useAdminStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('bkbb_admin_user') || 'null'),
  token: localStorage.getItem('bkbb_admin_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('bkbb_admin_token', token);
    localStorage.setItem('bkbb_admin_user', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('bkbb_admin_token');
    localStorage.removeItem('bkbb_admin_user');
    set({ user: null, token: null });
  },
}));

export default useAdminStore;
