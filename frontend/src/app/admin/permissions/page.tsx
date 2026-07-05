'use client';

import { Fragment, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api';
import { Key, Edit2, Trash2 } from 'lucide-react';

const typeLabels: Record<number, string> = { 1: '菜单', 2: '按钮', 3: '接口' };
const typeColors: Record<number, 'blue' | 'green' | 'gray'> = { 1: 'blue', 2: 'green', 3: 'gray' };

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<Record<string, unknown>[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', type: 1, parentId: 0, path: '', icon: '', sort: 0 });
  const [editId, setEditId] = useState<number | null>(null);

  const load = () => adminApi.permissions.list().then((res: any) => { if (res.code === 200) setPermissions(res.data || []); });
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const payload = { ...form, type: Number(form.type), parentId: Number(form.parentId), sort: Number(form.sort) };
    if (editId) { await adminApi.permissions.update(editId, payload); }
    else { await adminApi.permissions.create(payload); }
    setModalOpen(false);
    resetForm();
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该权限？')) return;
    await adminApi.permissions.delete(id);
    load();
  };

  const resetForm = () => {
    setForm({ name: '', code: '', type: 1, parentId: 0, path: '', icon: '', sort: 0 });
    setEditId(null);
  };

  const openEdit = (perm: Record<string, unknown>) => {
    setForm({
      name: perm.name as string,
      code: perm.code as string,
      type: (perm.type as number) || 1,
      parentId: (perm.parentId as number) || 0,
      path: (perm.path as string) || '',
      icon: (perm.icon as string) || '',
      sort: (perm.sort as number) || 0,
    });
    setEditId(perm.id as number);
    setModalOpen(true);
  };

  // 按 parentId 分组显示
  const parentPerms = permissions.filter(p => !p.parentId || p.parentId === 0);
  const getChildren = (parentId: number) => permissions.filter(p => p.parentId === parentId);

  return (
    <div className="flex flex-col h-full p-4 md:p-8 overflow-hidden">
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
            <h1 className="text-2xl font-semibold">权限管理</h1>
          </div>
          <Button onClick={() => { resetForm(); setModalOpen(true); }}>新建权限</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">编码</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">路径</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">排序</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {parentPerms.map((perm) => (
                <Fragment key={perm.id as number}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{perm.name as string}</td>
                    <td className="px-4 py-3 text-sm"><code className="bg-gray-100 px-2 py-0.5 rounded">{perm.code as string}</code></td>
                    <td className="px-4 py-3 text-sm"><Badge variant={typeColors[(perm.type as number) || 1] as 'blue' | 'green' | 'gray'}>{typeLabels[(perm.type as number) || 1]}</Badge></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{(perm.path as string) || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{perm.sort as number}</td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(perm)} title="编辑">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(perm.id as number)} title="删除">
                        <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-danger)' }} />
                      </Button>
                    </td>
                  </tr>
                  {getChildren(perm.id as number).map((child) => (
                    <tr key={child.id as number} className="hover:bg-gray-50 bg-gray-25">
                      <td className="px-4 py-3 text-sm pl-8 text-gray-600">└ {child.name as string}</td>
                      <td className="px-4 py-3 text-sm"><code className="bg-gray-100 px-2 py-0.5 rounded">{child.code as string}</code></td>
                      <td className="px-4 py-3 text-sm"><Badge variant={typeColors[(child.type as number) || 1] as 'blue' | 'green' | 'gray'}>{typeLabels[(child.type as number) || 1]}</Badge></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{(child.path as string) || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{child.sort as number}</td>
                      <td className="px-4 py-3 text-sm flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(child)} title="编辑">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(child.id as number)} title="删除">
                          <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-danger)' }} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? '编辑权限' : '新建权限'}
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">取消</Button>
            <Button onClick={handleSave} className="flex-1">保存</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="权限名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="权限编码" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="如 article:edit" />
          <Select
            label="类型"
            value={String(form.type)}
            onChange={(e) => setForm({ ...form, type: Number(e.target.value) })}
            options={[
              { value: 1, label: '菜单' },
              { value: 2, label: '按钮' },
              { value: 3, label: '接口' },
            ]}
          />
          <Select
            label="父权限"
            value={String(form.parentId)}
            onChange={(e) => setForm({ ...form, parentId: Number(e.target.value) })}
            placeholder="无（顶级）"
            options={parentPerms.filter(p => p.id !== editId).map((p) => ({ value: p.id as number, label: p.name as string }))}
          />
          <Input label="路径" value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} placeholder="/admin/articles" />
          <Input label="图标" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="lucide 图标名" />
          <Input label="排序" type="number" value={form.sort.toString()} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} />
        </div>
      </Modal>
    </div>
  );
}
