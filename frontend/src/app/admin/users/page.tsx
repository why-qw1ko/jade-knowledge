'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = () => {
    setLoading(true);
    adminApi.users.list({ pageNum: page, pageSize: 10 }).then((res: any) => {
      if (res.code === 200) { setUsers(res.data?.records || []); setTotal(res.data?.total || 0); }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除用户？')) return;
    await adminApi.users.delete(id);
    load();
  };

  const columns = [
    { key: 'username', title: '用户名' },
    { key: 'nickname', title: '昵称' },
    { key: 'email', title: '邮箱', render: (v: unknown) => String(v || '-') },
    { key: 'roles', title: '角色', render: (v: unknown) => (v as string[])?.map((r: string) => <Badge key={r} variant="blue">{r}</Badge>) || '-' },
    { key: 'status', title: '状态', render: (v: unknown) => <Badge variant={v === 1 ? 'green' : 'red'}>{v === 1 ? '正常' : '禁用'}</Badge> },
    { key: 'createTime', title: '注册时间' },
    {
      key: 'actions', title: '操作', render: (_: unknown, record: Record<string, unknown>) => (
        <div className="flex gap-2">
          <Button size="sm" variant="danger" onClick={() => handleDelete(record.id as number)}>删除</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>
      <DataTable columns={columns} data={users as Record<string, unknown>[]} loading={loading} total={total} page={page} onPageChange={setPage} />
    </div>
  );
}
