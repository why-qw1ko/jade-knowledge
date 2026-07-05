'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { Gem } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('请填写用户名和密码'); return; }
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      router.push('/');
    } catch (err: unknown) {
      setError((err as Error)?.message || '登录失败');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className="w-full max-w-md rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div className="text-center">
              <Gem className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--brand-primary)' }} />
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>登录</h1>
            </div>
          </div>
          <div className="px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="用户名" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="请输入用户名" />
              <Input label="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" />
              {error && <p className="text-sm" style={{ color: 'var(--status-danger)' }}>{error}</p>}
              <Button type="submit" className="w-full" loading={loading}>登录</Button>
              <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                还没有账号？<Link href="/register" className="hover:underline" style={{ color: 'var(--brand-primary)' }}>立即注册</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
