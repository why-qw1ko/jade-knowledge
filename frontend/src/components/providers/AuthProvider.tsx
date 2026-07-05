'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getToken, isAuthenticated as checkTokenValid } from '@/lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const init = useAuthStore((s) => s.init);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  useEffect(() => {
    const token = getToken();
    if (token && checkTokenValid()) {
      init();
      fetchProfile().finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full animate-bounce"
              style={{ backgroundColor: 'var(--brand-primary)', animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
