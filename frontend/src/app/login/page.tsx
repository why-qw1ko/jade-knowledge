'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
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
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-center">
              <Gem className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h1 className="text-xl font-bold">登录</h1>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="用户名" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="请输入用户名" />
              <Input label="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" loading={loading}>登录</Button>
              <p className="text-center text-sm text-gray-500">
                还没有账号？<Link href="/register" className="text-emerald-600 hover:underline">立即注册</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
