'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/lib/api';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.articles.list({ pageNum: page, pageSize: 10, keyword: keyword || undefined }).then((res: any) => {
      if (res.code === 200) { setArticles(res.data?.records || []); setTotal(res.data?.total || 0); }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, keyword]);

  const handleStatus = async (id: number, status: number) => {
    await adminApi.articles.updateStatus(id, status);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    await adminApi.articles.delete(id);
    load();
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
        <div className="flex gap-2">
          <Link href={`/admin/articles/${record.id}/edit`}><Button size="sm" variant="ghost">编辑</Button></Link>
          {(record as Record<string, unknown>).status === 0 && <Button size="sm" onClick={() => handleStatus(record.id as number, 1)}>提交审核</Button>}
          {(record as Record<string, unknown>).status === 1 && <Button size="sm" onClick={() => handleStatus(record.id as number, 2)}>发布</Button>}
          {(record as Record<string, unknown>).status === 2 && <Button size="sm" variant="ghost" onClick={() => handleStatus(record.id as number, 3)}>下线</Button>}
          <Button size="sm" variant="danger" onClick={() => handleDelete(record.id as number)}>删除</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Link href="/admin/articles/new"><Button>新建文章</Button></Link>
      </div>
      <DataTable
        columns={columns}
        data={articles as Record<string, unknown>[]}
        loading={loading}
        total={total}
        page={page}
        onPageChange={setPage}
        onSearch={setKeyword}
        searchPlaceholder="搜索文章标题..."
      />
    </div>
  );
}
