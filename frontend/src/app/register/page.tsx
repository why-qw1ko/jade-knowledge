'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api';
import { Gem } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', nickname: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('请填写必填项'); return; }
    if (form.password !== form.confirmPassword) { setError('两次密码不一致'); return; }
    setLoading(true);
    setError('');
    try {
      const res: any = await authApi.register({
        username: form.username,
        password: form.password,
        nickname: form.nickname || form.username,
      });
      if (res.code === 200) {
        router.push('/login');
      } else {
        setError(res.message || '注册失败');
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || '注册失败');
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
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>注册</h1>
            </div>
          </div>
          <div className="px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="用户名 *" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="请输入用户名" />
              <Input label="昵称" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="请输入昵称" />
              <Input label="密码 *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="请输入密码" />
              <Input label="确认密码 *" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="请再次输入密码" />
              {error && <p className="text-sm" style={{ color: 'var(--status-danger)' }}>{error}</p>}
              <Button type="submit" className="w-full" loading={loading}>注册</Button>
              <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                已有账号？<Link href="/login" className="hover:underline" style={{ color: 'var(--brand-primary)' }}>立即登录</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
