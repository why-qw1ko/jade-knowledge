'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { adminApi } from '@/lib/api';

export default function NewArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', summary: '', content: '', coverImage: '', categoryId: '', tags: '', status: 0 });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.categories.list().then((res: any) => {
      if (res.code === 200) setCategories(res.data || []);
    });
  }, []);

  const handleSave = async (status: number) => {
    if (!form.title) { alert('请输入标题'); return; }
    setSaving(true);
    try {
      const res: any = await adminApi.articles.create({
        ...form,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        status,
      });
      if (res.code === 200) router.push('/admin/articles');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新建文章</h1>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input label="标题 *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="文章标题" />
          <Input label="摘要" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="文章摘要（选填）" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">请选择分类</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="标签" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="多个标签用逗号分隔" />
          <Input label="封面图URL" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="图片URL（选填）" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">正文内容</label>
            <RichTextEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={() => handleSave(0)} variant="secondary" loading={saving}>保存草稿</Button>
            <Button onClick={() => handleSave(1)} loading={saving}>提交审核</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
