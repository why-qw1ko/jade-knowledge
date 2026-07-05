'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { adminApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Megaphone, Plus, Edit2, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AnnouncementForm {
  title: string;
  content: string;
  type: number;
  isTop: number;
  status: number;
}

const emptyForm: AnnouncementForm = {
  title: '',
  content: '',
  type: 0,
  isTop: 0,
  status: 0,
};

const typeMap: Record<number, { label: string; variant: 'blue' | 'yellow' | 'red' }> = {
  0: { label: '普通公告', variant: 'blue' },
  1: { label: '重要公告', variant: 'yellow' },
  2: { label: '紧急公告', variant: 'red' },
};

const statusMap: Record<number, { label: string; variant: 'gray' | 'green' | 'red' }> = {
  0: { label: '草稿', variant: 'gray' },
  1: { label: '已发布', variant: 'green' },
  2: { label: '已下线', variant: 'red' },
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<AnnouncementForm>(emptyForm);
  const [formId, setFormId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [actingId, setActingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    const params: Record<string, unknown> = { pageNum: page, pageSize: 10 };
    if (statusFilter) params.status = Number(statusFilter);
    adminApi.announcements.list(params).then((res: any) => {
      if (res.code === 200) {
        setAnnouncements(res.data?.records || []);
        setTotal(res.data?.total || 0);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const openCreate = () => {
    setFormMode('create');
    setForm(emptyForm);
    setFormId(null);
    setFormOpen(true);
  };

  const openEdit = (record: Record<string, unknown>) => {
    setFormMode('edit');
    setForm({
      title: (record.title as string) || '',
      content: (record.content as string) || '',
      type: (record.type as number) ?? 0,
      isTop: (record.isTop as number) ?? 0,
      status: (record.status as number) ?? 0,
    });
    setFormId(record.id as number);
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!form.title.trim()) { alert('请输入公告标题'); return; }
    if (!form.content.trim()) { alert('请输入公告内容'); return; }
    setFormLoading(true);
    try {
      if (formMode === 'create') {
        await adminApi.announcements.create(form as unknown as Record<string, unknown>);
      } else {
        await adminApi.announcements.update(formId!, form as unknown as Record<string, unknown>);
      }
      setFormOpen(false);
      load();
    } catch (e: any) {
      alert(e?.message || '操作失败');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该公告？此操作不可恢复。')) return;
    try {
      await adminApi.announcements.delete(id);
      load();
    } catch (e: any) {
      alert(e?.message || '删除失败');
    }
  };

  const handleStatus = async (id: number, status: number) => {
    setActingId(id);
    try {
      await adminApi.announcements.updateStatus(id, status);
      load();
    } catch (e: any) {
      alert(e?.message || '操作失败');
    } finally {
      setActingId(null);
    }
  };

  const columns = [
    { key: 'title', title: '标题', render: (v: unknown) => (
      <span className="font-medium line-clamp-1 max-w-xs block">{String(v || '-')}</span>
    )},
    { key: 'type', title: '类型', width: '100px', render: (v: unknown) => {
      const t = typeMap[v as number];
      return t ? <Badge variant={t.variant}>{t.label}</Badge> : '-';
    }},
    { key: 'isTop', title: '置顶', width: '80px', render: (v: unknown) => (
      v === 1 ? <Badge variant="yellow">置顶</Badge> : <span style={{ color: 'var(--text-muted)' }}>-</span>
    )},
    { key: 'status', title: '状态', width: '100px', render: (v: unknown) => {
      const s = statusMap[v as number];
      return s ? <Badge variant={s.variant}>{s.label}</Badge> : '-';
    }},
    { key: 'publishTime', title: '发布时间', width: '160px', render: (v: unknown) => (
      <span className="text-xs">{v ? formatDateTime(String(v)) : '-'}</span>
    )},
    { key: 'createTime', title: '创建时间', width: '160px', render: (v: unknown) => (
      <span className="text-xs">{formatDateTime(String(v))}</span>
    )},
    { key: 'actions', title: '操作', width: '140px', render: (_: unknown, record: Record<string, unknown>) => {
      const id = record.id as number;
      const busy = actingId === id;
      return (
        <div className="flex gap-1 items-center">
          <Button size="sm" variant="ghost" onClick={() => openEdit(record)} title="编辑">
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          {record.status === 0 && (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleStatus(id, 1)} title="发布">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--status-success)' }} />}
            </Button>
          )}
          {record.status === 1 && (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleStatus(id, 2)} title="下线">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--status-warning)' }} />}
            </Button>
          )}
          {record.status === 2 && (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleStatus(id, 1)} title="重新发布">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--status-success)' }} />}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => handleDelete(id)} title="删除">
            <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-danger)' }} />
          </Button>
        </div>
      );
    }},
  ];

  return (
    <div className="flex flex-col h-full p-4 md:p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Megaphone className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>公告管理</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" />新建公告
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <DataTable
          columns={columns}
          data={announcements}
          loading={loading}
          total={total}
          page={page}
          onPageChange={setPage}
          actions={
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={[
                { value: '', label: '全部状态' },
                { value: '0', label: '草稿' },
                { value: '1', label: '已发布' },
                { value: '2', label: '已下线' },
              ]}
            />
          }
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={formMode === 'create' ? '新建公告' : '编辑公告'}
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setFormOpen(false)} className="flex-1">取消</Button>
            <Button onClick={handleFormSubmit} loading={formLoading} className="flex-1">
              {formMode === 'create' ? '创建' : '保存'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="公告标题 *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="请输入公告标题"
          />
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              公告内容 *
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="请输入公告内容"
              rows={6}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none"
              style={{
                border: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="公告类型"
              value={String(form.type)}
              onChange={(e) => setForm({ ...form, type: Number(e.target.value) })}
              options={[
                { value: 0, label: '普通公告' },
                { value: 1, label: '重要公告' },
                { value: 2, label: '紧急公告' },
              ]}
            />
            <Select
              label="是否置顶"
              value={String(form.isTop)}
              onChange={(e) => setForm({ ...form, isTop: Number(e.target.value) })}
              options={[
                { value: 0, label: '否' },
                { value: 1, label: '是' },
              ]}
            />
          </div>
          <Select
            label="状态"
            value={String(form.status)}
            onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
            options={[
              { value: 0, label: '草稿' },
              { value: 1, label: '已发布' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
