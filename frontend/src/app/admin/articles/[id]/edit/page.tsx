'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { adminApi } from '@/lib/api';

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [form, setForm] = useState({ title: '', summary: '', content: '', coverImage: '', categoryId: '', tags: '' });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.categories.list().then((res: any) => { if (res.code === 200) setCategories(res.data || []); });
    adminApi.articles.getById(id).then((res: any) => {
      if (res.code === 200) {
        const d = res.data;
        setForm({ title: d.title || '', summary: d.summary || '', content: d.content || '', coverImage: d.coverImage || '', categoryId: d.categoryId ? String(d.categoryId) : '', tags: d.tags || '' });
      }
    });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.articles.update(id, { ...form, categoryId: form.categoryId ? Number(form.categoryId) : undefined });
      router.push('/admin/articles');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">编辑文章</h1>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input label="标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="摘要" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">请选择</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="标签" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <Input label="封面图URL" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">正文</label>
            <RichTextEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => router.back()}>取消</Button>
            <Button onClick={handleSave} loading={saving}>保存修改</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
