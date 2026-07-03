'use client';

import { create } from 'zustand';
import { authApi, userApi } from '@/lib/api';
import { setToken, removeToken, getToken, isAuthenticated } from '@/lib/auth';

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  roles?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    const res: any = await authApi.login({ username, password });
    if (res.code === 200) {
      const { accessToken, user } = res.data;
      setToken(accessToken);
      set({ user, token: accessToken, isAuthenticated: true });
    } else {
      throw new Error(res.message);
    }
  },

  logout: () => {
    removeToken();
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  fetchProfile: async () => {
    try {
      const res: any = await userApi.getProfile();
      if (res.code === 200) {
        set({ user: res.data, isAuthenticated: true });
      }
    } catch {
      removeToken();
      set({ user: null, isAuthenticated: false });
    }
  },

  init: () => {
    const token = getToken();
    if (token && isAuthenticated()) {
      set({ token, isAuthenticated: true });
    }
  },
}));
