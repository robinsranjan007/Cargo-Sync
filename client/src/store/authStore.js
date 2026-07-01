import { create } from 'zustand';
import { authAPI } from '../services/api.js';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.post('/login', { email, password });
      const { accessToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false
      });
      return { success: false };
    }
  },

 register: async (name, email, password, role, companyName) => {
  set({ isLoading: true, error: null });
  try {
    const response = await authAPI.post('/register', {
      name,
      email,
      password,
      role,
      companyName
    });
    const { accessToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false
    });
    return { success: true };
  } catch (error) {
    set({
      error: error.response?.data?.message || 'Registration failed',
      isLoading: false
    });
    return { success: false };
  }
},

  logout: async () => {
    try {
      await authAPI.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false
      });
    }
  }
}));

export default useAuthStore;