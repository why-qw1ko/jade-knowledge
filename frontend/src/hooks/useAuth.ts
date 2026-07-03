'use client';

import { useAuthStore } from '@/store/authStore';
import { isAdmin as checkAdmin } from '@/lib/auth';

export function useAuth() {
  const { user, isAuthenticated, login, logout, fetchProfile } = useAuthStore();
  return {
    user,
    isAuthenticated,
    login,
    logout,
    fetchProfile,
    isAdmin: user?.roles?.includes('ADMIN') || checkAdmin(),
  };
}
