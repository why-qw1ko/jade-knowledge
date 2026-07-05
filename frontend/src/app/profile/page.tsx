'use client';

import { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArticleList } from '@/components/article/ArticleList';
import { useAuth } from '@/hooks/useAuth';
import { favoritesApi, userApi } from '@/lib/api';
import { User, Camera, Heart, Settings } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, fetchProfile } = useAuth();
  const [tab, setTab] = useState<'favorites' | 'profile'>('favorites');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nickname: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res: any = await userApi.uploadAvatar(formData);
      if (res.code === 200) {
        fetchProfile();
      }
    } catch (error) {
      alert('上传失败，请重试');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Hero section */}
        <div className="py-12" style={{ backgroundColor: 'var(--brand-primary)', background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-dark, #059669) 100%)' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-4 border-white/20 shadow-lg cursor-pointer"
                  style={{ backgroundColor: 'var(--brand-light)' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12" style={{ color: 'var(--brand-primary)' }} />
                  )}
                </div>
                {/* Upload overlay */}
                <div
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingAvatar ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              {/* User info */}
              <div className="text-white">
                <h1 className="text-2xl font-bold">{user?.nickname || user?.username}</h1>
                <p className="text-white/70 text-sm mt-1">角色: {user?.roles?.join(', ') || '用户'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <button
              onClick={() => setTab('favorites')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: tab === 'favorites' ? 'var(--bg-card)' : 'transparent',
                color: tab === 'favorites' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                boxShadow: tab === 'favorites' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Heart className="w-4 h-4" />
              我的收藏
            </button>
            <button
              onClick={() => setTab('profile')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: tab === 'profile' ? 'var(--bg-card)' : 'transparent',
                color: tab === 'profile' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                boxShadow: tab === 'profile' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Settings className="w-4 h-4" />
              个人信息
            </button>
          </div>

          {/* Tab content */}
          {tab === 'favorites' ? (
            <div>
              {loading ? (
                <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>加载中...</div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>暂无收藏</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>浏览文章时点击收藏按钮即可添加</p>
                </div>
              ) : (
                <ArticleList articles={favorites} loading={loading} />
              )}
            </div>
          ) : (
            <div className="rounded-xl p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>编辑个人信息</h3>

              {/* Avatar section */}
              <div className="flex items-center gap-6 mb-8 pb-8" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <div className="relative group">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-md cursor-pointer"
                    style={{ borderColor: 'var(--brand-primary)', backgroundColor: 'var(--brand-light)' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10" style={{ color: 'var(--brand-primary)' }} />
                    )}
                  </div>
                  <div
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingAvatar ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>头像</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>点击头像或下方按钮上传新头像</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm mt-2 font-medium transition-colors"
                    style={{ color: 'var(--brand-primary)' }}
                  >
                    {uploadingAvatar ? '上传中...' : '更换头像'}
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-5">
                <Input
                  label="昵称"
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  placeholder="请输入昵称"
                />
                <Input
                  label="邮箱"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="选填"
                  type="email"
                />
                <Input
                  label="手机号"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="选填"
                  type="tel"
                />
                <div className="pt-4">
                  <Button onClick={handleSave} loading={saving} className="px-8">
                    保存修改
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
