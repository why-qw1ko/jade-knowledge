'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (!isAdmin) router.push('/');
  }, [isAuthenticated, isAdmin]);

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
