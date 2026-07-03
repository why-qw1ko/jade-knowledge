'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';

export default function AdminCrawlPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [triggerKeyword, setTriggerKeyword] = useState('');
  const [triggering, setTriggering] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.crawl.listResults({ pageNum: page, pageSize: 10 }).then((res: any) => {
      if (res.code === 200) { setResults(res.data?.records || []); setTotal(res.data?.total || 0); }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleTrigger = async () => {
    if (!triggerKeyword) return;
    setTriggering(true);
    try { await adminApi.crawl.trigger(triggerKeyword); load(); } finally { setTriggering(false); }
  };

  const handleApprove = async (id: number) => { await adminApi.crawl.approve(id); load(); };
  const handleReject = async (id: number) => { await adminApi.crawl.reject(id); load(); };
  const handlePublish = async (id: number) => { await adminApi.crawl.publish(id); load(); };

  const statusMap: Record<number, { label: string; variant: 'gray' | 'green' | 'red' | 'yellow' }> = {
    0: { label: '待审核', variant: 'yellow' },
    1: { label: '已通过', variant: 'green' },
    2: { label: '已拒绝', variant: 'red' },
    3: { label: '已发布', variant: 'gray' },
  };

  const columns = [
    { key: 'title', title: '标题' },
    { key: 'source', title: '来源' },
    { key: 'status', title: '状态', render: (v: unknown) => { const s = statusMap[v as number]; return <Badge variant={s?.variant}>{s?.label || '未知'}</Badge>; } },
    { key: 'createTime', title: '抓取时间' },
    {
      key: 'actions', title: '操作', render: (_: unknown, record: Record<string, unknown>) => (
        <div className="flex gap-2">
          {(record as Record<string, unknown>).status === 0 && (
            <>
              <Button size="sm" onClick={() => handleApprove(record.id as number)}>通过</Button>
              <Button size="sm" variant="danger" onClick={() => handleReject(record.id as number)}>拒绝</Button>
            </>
          )}
          {(record as Record<string, unknown>).status === 1 && (
            <Button size="sm" onClick={() => handlePublish(record.id as number)}>发布为文章</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">AI抓取管理</h1>
      <div className="flex gap-3 mb-6">
        <Input value={triggerKeyword} onChange={(e) => setTriggerKeyword(e.target.value)} placeholder="输入关键词触发抓取" />
        <Button onClick={handleTrigger} loading={triggering}>触发抓取</Button>
      </div>
      <DataTable columns={columns} data={results as Record<string, unknown>[]} loading={loading} total={total} page={page} onPageChange={setPage} />
    </div>
  );
}
