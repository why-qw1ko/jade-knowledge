'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/lib/api';
import { FileText, Edit2, Trash2, CheckCircle, XCircle, Send } from 'lucide-react';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  const load = useCallback((p: number, kw: string) => {
    setLoading(true);
    adminApi.articles.list({ pageNum: p, pageSize: 10, keyword: kw || undefined }).then((res: any) => {
      if (res.code === 200) { setArticles(res.data?.records || []); setTotal(res.data?.total || 0); }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(page, keyword); }, [page, keyword, load]);

  const handleSearch = (kw: string) => {
    setKeyword(kw);
    setPage(1);
    load(1, kw);
  };

  const handleStatus = async (id: number, status: number) => {
    await adminApi.articles.updateStatus(id, status);
    load(page, keyword);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    await adminApi.articles.delete(id);
    load(page, keyword);
  };

  const columns = [
    { key: 'title', title: '标题' },
    { key: 'categoryName', title: '分类' },
    { key: 'status', title: '状态', render: (v: unknown) => <StatusBadge status={v as number} /> },
    { key: 'authorName', title: '作者' },
    { key: 'viewCount', title: '浏览', render: (v: unknown) => String(v || 0) },
    { key: 'createTime', title: '创建时间' },
    {
      key: 'actions', title: '操作', render: (_: unknown, record: Record<string, unknown>) => (
        <div className="flex gap-1 flex-wrap">
          <Link href={`/admin/articles/${record.id}/edit`}>
            <Button size="sm" variant="ghost" title="编辑">
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
          </Link>
          {(record as Record<string, unknown>).status === 0 && (
            <Button size="sm" variant="ghost" onClick={() => handleStatus(record.id as number, 1)} title="提交审核">
              <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--status-success)' }} />
            </Button>
          )}
          {(record as Record<string, unknown>).status === 1 && (
            <Button size="sm" variant="ghost" onClick={() => handleStatus(record.id as number, 2)} title="发布">
              <Send className="w-3.5 h-3.5" style={{ color: 'var(--status-info)' }} />
            </Button>
          )}
          {(record as Record<string, unknown>).status === 2 && (
            <Button size="sm" variant="ghost" onClick={() => handleStatus(record.id as number, 3)} title="下线">
              <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--status-danger)' }} />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => handleDelete(record.id as number)} title="删除">
            <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-danger)' }} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full p-4 md:p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>文章管理</h1>
        </div>
        <Link href="/admin/articles/new"><Button>新建文章</Button></Link>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <DataTable
          columns={columns}
          data={articles as Record<string, unknown>[]}
          loading={loading}
          total={total}
          page={page}
          onPageChange={setPage}
          onSearch={handleSearch}
          searchPlaceholder="搜索文章标题..."
        />
      </div>
    </div>
  );
}
