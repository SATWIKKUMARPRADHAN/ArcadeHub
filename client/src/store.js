import { create } from 'zustand';

const useStore = create((set) => ({
  username: localStorage.getItem('arcade_username') || null,
  login: (name) => {
    localStorage.setItem('arcade_username', name);
    set({ username: name });
  },
  logout: () => {
    localStorage.removeItem('arcade_username');
    set({ username: null });
  }
}));

export default useStore;
