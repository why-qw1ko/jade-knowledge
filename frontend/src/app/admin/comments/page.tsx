'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { CheckCircle, XCircle, Trash2, MessageSquare, ExternalLink, Loader2, Edit2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

type Tab = 'all' | 'pending' | 'approved' | 'rejected';

const tabs: { key: Tab; label: string; status?: number }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核', status: 0 },
  { key: 'approved', label: '已通过', status: 1 },
  { key: 'rejected', label: '已拒绝', status: 2 },
];

const statusMap: Record<number, { label: string; variant: 'yellow' | 'green' | 'red' }> = {
  0: { label: '待审核', variant: 'yellow' },
  1: { label: '已通过', variant: 'green' },
  2: { label: '已拒绝', variant: 'red' },
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState<Tab>('all');
  const [actingId, setActingId] = useState<number | null>(null);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    const tabDef = tabs.find((t) => t.key === tab)!;
    const params: Record<string, unknown> = { pageNum: page, pageSize: 10 };
    if (tabDef.status !== undefined) params.status = tabDef.status;

    const apiCall = tab === 'pending'
      ? adminApi.comments.pending({ pageNum: page, pageSize: 10 })
      : adminApi.comments.list(params);

    apiCall.then((res: any) => {
      if (res.code === 200) { setComments(res.data?.records || []); setTotal(res.data?.total || 0); }
    }).finally(() => { if (!silent) setLoading(false); });
  };

  useEffect(() => { setPage(1); }, [tab]);
  useEffect(() => { load(); }, [page, tab]);

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'delete') => {
    if (action === 'delete' && !confirm('确定删除该评论？')) return;
    setActingId(id);
    try {
      if (action === 'approve') await adminApi.comments.approve(id);
      else if (action === 'reject') await adminApi.comments.reject(id);
      else await adminApi.comments.delete(id);
      load(true);
    } catch (e: any) {
      alert(e?.message || '操作失败');
    } finally {
      setActingId(null);
    }
  };

  const openEdit = (record: Record<string, unknown>) => {
    setEditId(record.id as number);
    setEditContent((record.content as string) || '');
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim()) { alert('评论内容不能为空'); return; }
    setEditLoading(true);
    try {
      await adminApi.comments.update(editId!, { content: editContent });
      setEditOpen(false);
      load(true);
    } catch (e: any) {
      alert(e?.message || '编辑失败');
    } finally {
      setEditLoading(false);
    }
  };

  const columns = [
    { key: 'content', title: '评论内容', render: (v: unknown) => <span className="line-clamp-2 max-w-xs block">{String(v)}</span> },
    {
      key: 'articleTitle', title: '所属文章', render: (v: unknown, record: Record<string, unknown>) => {
        const title = String(v || '-');
        const articleId = record.articleId;
        if (articleId) {
          return (
            <a href={`/articles/${articleId}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline max-w-[160px]"
              style={{ color: 'var(--brand-primary)' }}>
              <span className="truncate">{title}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          );
        }
        return <span className="text-gray-400">{title}</span>;
      },
    },
    { key: 'userName', title: '用户', render: (v: unknown) => <span className="font-medium">{String(v || '-')}</span> },
    {
      key: 'status', title: '状态', render: (v: unknown) => {
        const s = statusMap[v as number];
        return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(v);
      },
    },
    { key: 'createTime', title: '时间', render: (v: unknown) => formatDateTime(String(v)) },
    {
      key: 'actions', title: '操作', render: (_: unknown, record: Record<string, unknown>) => {
        const status = record.status as number;
        const id = record.id as number;
        const busy = actingId === id;
        return (
          <div className="flex gap-1 items-center">
            <Button size="sm" variant="ghost" onClick={() => openEdit(record)} title="编辑">
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            {status === 0 && (
              <>
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleAction(id, 'approve')} title="通过">
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--status-success)' }} />}
                </Button>
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleAction(id, 'reject')} title="拒绝">
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--status-danger)' }} />}
                </Button>
              </>
            )}
            {status === 2 && (
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleAction(id, 'approve')} title="通过">
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--status-success)' }} />}
              </Button>
            )}
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleAction(id, 'delete')} title="删除">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-danger)' }} />}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col h-full p-4 md:p-8 overflow-hidden">
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
          <h1 className="text-2xl font-semibold">评论管理</h1>
        </div>

        <div className="flex gap-1 mb-4 border-b border-gray-200">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? '' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={tab === t.key ? { borderBottomColor: 'var(--brand-primary)', color: 'var(--brand-primary)' } : undefined}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <DataTable columns={columns} data={comments} loading={loading} total={total} page={page} onPageChange={setPage} />
      </div>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="编辑评论"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setEditOpen(false)} className="flex-1">取消</Button>
            <Button onClick={handleEditSubmit} loading={editLoading} className="flex-1">保存</Button>
          </div>
        }
      >
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
            评论内容
          </label>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="请输入评论内容"
            rows={5}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none"
            style={{
              border: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
