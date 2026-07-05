'use client';

import { useEffect, useState, useRef } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { adminApi, resolveImageUrl } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Images, Plus, X, Search, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  articleId?: number;
  sort: number;
  status: number;
  createTime?: string;
}

interface ArticleOption {
  id: number;
  title: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    articleId: null as number | null,
    sort: 0,
    status: 1,
  });

  // Article search
  const [articleSearch, setArticleSearch] = useState('');
  const [articleOptions, setArticleOptions] = useState<ArticleOption[]>([]);
  const [selectedArticleTitle, setSelectedArticleTitle] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const load = () => {
    setLoading(true);
    adminApi.banners.list({ pageNum: page, pageSize: 10 }).then((res: any) => {
      if (res.code === 200) {
        setBanners(res.data?.records || []);
        setTotal(res.data?.total || 0);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleArticleSearch = (keyword: string) => {
    setArticleSearch(keyword);
    setSelectedArticleTitle('');
    setForm({ ...form, articleId: null });

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!keyword.trim()) {
      setArticleOptions([]);
      setShowDropdown(false);
      return;
    }

    searchTimerRef.current = setTimeout(() => {
      adminApi.articlesSearch.byTitle(keyword).then((res: any) => {
        if (res.code === 200) {
          setArticleOptions(res.data || []);
          setShowDropdown(true);
        }
      });
    }, 300);
  };

  const selectArticle = (article: ArticleOption) => {
    setForm({ ...form, articleId: article.id, linkUrl: '' });
    setSelectedArticleTitle(article.title);
    setArticleSearch(article.title);
    setShowDropdown(false);
  };

  const clearArticle = () => {
    setForm({ ...form, articleId: null });
    setArticleSearch('');
    setSelectedArticleTitle('');
    setArticleOptions([]);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: '', imageUrl: '', linkUrl: '', articleId: null, sort: 0, status: 1 });
    setArticleSearch('');
    setSelectedArticleTitle('');
    setShowModal(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      articleId: banner.articleId || null,
      sort: banner.sort || 0,
      status: banner.status,
    });
    if (banner.articleId) {
      setSelectedArticleTitle('已关联文章 (ID: ' + banner.articleId + ')');
      setArticleSearch('已关联文章 (ID: ' + banner.articleId + ')');
    } else {
      setSelectedArticleTitle('');
      setArticleSearch('');
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { alert('请输入标题'); return; }
    if (!form.imageUrl.trim()) { alert('请上传图片'); return; }

    setSaving(true);
    try {
      const payload = { ...form };
      // Mutual exclusivity: if article selected, clear link
      if (payload.articleId) payload.linkUrl = '';

      let res: any;
      if (editingId) {
        res = await adminApi.banners.update(editingId, payload);
      } else {
        res = await adminApi.banners.create(payload);
      }
      if (res?.code === 200) {
        setShowModal(false);
        load();
      } else {
        alert(res?.message || '保存失败');
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该轮播图？')) return;
    await adminApi.banners.delete(id);
    load();
  };

  const columns = [
    {
      key: 'imageUrl', title: '图片', render: (v: unknown) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolveImageUrl(String(v))} alt="" className="w-24 h-14 object-cover rounded-lg border border-gray-100" />
      ),
    },
    { key: 'title', title: '标题', render: (v: unknown) => <span className="font-medium">{String(v)}</span> },
    {
      key: 'link', title: '链接', render: (_: unknown, record: Record<string, unknown>) => {
        const r = record as unknown as Banner;
        if (r.articleId) return <span className="text-sm" style={{ color: 'var(--brand-primary)' }}>文章 ID: {r.articleId}</span>;
        if (r.linkUrl) return <span className="text-blue-600 text-sm truncate max-w-[160px] block">{r.linkUrl}</span>;
        return <span className="text-gray-400 text-sm">-</span>;
      },
    },
    { key: 'sort', title: '排序', render: (v: unknown) => String(v ?? 0) },
    {
      key: 'status', title: '状态', render: (v: unknown) => (
        <Badge variant={v === 1 ? 'green' : 'gray'}>{v === 1 ? '启用' : '禁用'}</Badge>
      ),
    },
    { key: 'createTime', title: '创建时间', render: (v: unknown) => formatDateTime(String(v)) },
    {
      key: 'actions', title: '操作', render: (_: unknown, record: Record<string, unknown>) => {
        const r = record as unknown as Banner;
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title="编辑">
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)} title="删除">
              <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-danger)' }} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col h-full p-4 md:p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Images className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
          <h1 className="text-2xl font-semibold">轮播图管理</h1>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-1" />新增轮播图
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <DataTable columns={columns} data={banners as unknown as Record<string, unknown>[]} loading={loading} total={total} page={page} onPageChange={setPage} />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? '编辑轮播图' : '新增轮播图'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>取消</Button>
            <Button onClick={handleSave} loading={saving}>保存</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="标题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="轮播图标题"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">图片</label>
            <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
          </div>

          {/* Article selector with fuzzy search */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">关联文章（可选）</label>
            <div className="relative">
              <input
                type="text"
                value={articleSearch}
                onChange={(e) => handleArticleSearch(e.target.value)}
                onFocus={() => { if (articleOptions.length > 0) setShowDropdown(true); }}
                placeholder="输入文章标题搜索..."
                disabled={!!form.linkUrl}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm pr-8 focus:outline-none focus:border-[var(--brand-primary)] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {form.articleId ? (
                <button onClick={clearArticle} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              )}
            </div>
            {showDropdown && articleOptions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
                {articleOptions.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => selectArticle(article)}
                    className="w-full text-left px-3 py-2 text-sm transition-colors truncate hover:bg-[var(--bg-hover)]"
                  >
                    {article.title}
                  </button>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-400">选择文章后，点击轮播图将跳转到文章详情页</p>
          </div>

          {/* Link input (mutually exclusive with article) */}
          <Input
            label="自定义链接（可选）"
            value={form.linkUrl}
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value, articleId: null })}
            placeholder="https://example.com"
            disabled={!!form.articleId}
          />
          {form.articleId && (
            <p className="text-xs text-amber-600">已关联文章，链接输入已禁用。如需填写链接，请先清除文章选择。</p>
          )}

          <Input
            label="排序（数字越小越靠前）"
            type="number"
            value={String(form.sort)}
            onChange={(e) => setForm({ ...form, sort: Number(e.target.value) || 0 })}
          />

          <Select
            label="状态"
            value={String(form.status)}
            onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
            options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]}
          />
        </div>
      </Modal>
    </div>
  );
}
