'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { ImageUpload, MultiImageUpload } from '@/components/admin/ImageUpload';
import { VideoUpload } from '@/components/admin/VideoUpload';
import { adminApi } from '@/lib/api';
import { Code, FileText, Info } from 'lucide-react';

interface VideoItem { videoUrl: string; coverUrl?: string; duration?: number; sort?: number; }

export default function NewArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', summary: '', content: '', contentFormat: 'markdown' as 'html' | 'markdown', coverImage: '', categoryId: '', tags: '', status: 0 });
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
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
        images,
        videos: videos.map((v, i) => ({ ...v, sort: i })),
      });
      if (res.code === 200) router.push('/admin/articles');
    } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-8 overflow-hidden">
      <h1 className="text-2xl font-bold mb-6 flex-shrink-0">新建文章</h1>
      <div className="flex-1 overflow-y-auto min-h-0">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input label="标题 *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="文章标题" />
          <Input label="摘要" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="文章摘要（选填）" />
          <Select
            label="分类"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            placeholder="请选择分类"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Input label="标签" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="多个标签用逗号分隔" />

          <div>
            <ImageUpload label="封面图" value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })} />
            <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Info className="w-3 h-3" />
              建议尺寸 800x400，支持 jpg/png/gif 格式。未上传时将使用默认封面。
            </p>
          </div>

          {/* Content format selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">内容格式</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setForm({ ...form, contentFormat: 'markdown' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  form.contentFormat === 'markdown' ? '' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
                style={form.contentFormat === 'markdown' ? { borderColor: 'var(--brand-primary)', backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' } : undefined}>
                <Code className="w-4 h-4" />Markdown
              </button>
              <button type="button" onClick={() => setForm({ ...form, contentFormat: 'html' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  form.contentFormat === 'html' ? '' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
                style={form.contentFormat === 'html' ? { borderColor: 'var(--brand-primary)', backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' } : undefined}>
                <FileText className="w-4 h-4" />富文本 (HTML)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">正文内容</label>
            {form.contentFormat === 'html' ? (
              <RichTextEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
            ) : (
              <MarkdownEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
            )}
          </div>

          <MultiImageUpload label="文章图片" value={images} onChange={setImages} max={20} />

          <VideoUpload label="文章视频" value={videos} onChange={setVideos} max={5} />

          <div className="flex gap-3 pt-4">
            <Button onClick={() => handleSave(0)} variant="secondary" loading={saving}>保存草稿</Button>
            <Button onClick={() => handleSave(1)} loading={saving}>提交审核</Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
