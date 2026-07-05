'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (!isAdmin) router.push('/');
  }, [isAuthenticated, isAdmin]);

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {children}
      </main>
    </div>
  );
}
