'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = () => {
    setLoading(true);
    adminApi.comments.pending({ pageNum: page, pageSize: 10 }).then((res: any) => {
      if (res.code === 200) { setComments(res.data?.records || []); setTotal(res.data?.total || 0); }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleApprove = async (id: number) => { await adminApi.comments.approve(id); load(); };
  const handleReject = async (id: number) => { await adminApi.comments.reject(id); load(); };
  const handleDelete = async (id: number) => { if (confirm('确定删除？')) { await adminApi.comments.delete(id); load(); } };

  const columns = [
    { key: 'content', title: '评论内容', render: (v: unknown) => <span className="line-clamp-2 max-w-xs block">{String(v)}</span> },
    { key: 'userName', title: '用户' },
    { key: 'createTime', title: '时间', render: (v: unknown) => formatDateTime(String(v)) },
    {
      key: 'actions', title: '操作', render: (_: unknown, record: Record<string, unknown>) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleApprove(record.id as number)}>通过</Button>
          <Button size="sm" variant="danger" onClick={() => handleReject(record.id as number)}>拒绝</Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(record.id as number)}>删除</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">评论管理</h1>
      <DataTable columns={columns} data={comments as Record<string, unknown>[]} loading={loading} total={total} page={page} onPageChange={setPage} />
    </div>
  );
}
