'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ArticleList } from '@/components/article/ArticleList';
import { Spinner } from '@/components/ui/Loading';
import { useAuth } from '@/hooks/useAuth';
import { favoritesApi, userApi } from '@/lib/api';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, fetchProfile } = useAuth();
  const [tab, setTab] = useState<'favorites' | 'profile'>('favorites');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nickname: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    fetchProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) setForm({ nickname: user.nickname || '', email: '', phone: '' });
  }, [user]);

  useEffect(() => {
    if (tab === 'favorites' && isAuthenticated) {
      setLoading(true);
      favoritesApi.list(1, 20).then((res: any) => {
        if (res.code === 200) setFavorites(res.data?.records || []);
      }).finally(() => setLoading(false));
    }
  }, [tab, isAuthenticated]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile(form);
      fetchProfile();
    } finally { setSaving(false); }
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">个人中心</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button onClick={() => setTab('favorites')} className={`pb-3 text-sm font-medium ${tab === 'favorites' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}>我的收藏</button>
          <button onClick={() => setTab('profile')} className={`pb-3 text-sm font-medium ${tab === 'profile' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}>个人信息</button>
        </div>

        {tab === 'favorites' ? (
          <ArticleList articles={favorites} loading={loading} />
        ) : (
          <Card>
            <CardHeader><h3 className="font-semibold">编辑个人信息</h3></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold">{user?.username}</p>
                  <p className="text-sm text-gray-500">角色: {user?.roles?.join(', ') || '用户'}</p>
                </div>
              </div>
              <Input label="昵称" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
              <Input label="邮箱" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="选填" />
              <Input label="手机号" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="选填" />
              <Button onClick={handleSave} loading={saving}>保存修改</Button>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </>
  );
}
