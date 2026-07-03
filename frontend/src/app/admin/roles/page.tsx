'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Record<string, unknown>[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [editId, setEditId] = useState<number | null>(null);

  const load = () => adminApi.roles.list().then((res: any) => { if (res.code === 200) setRoles(res.data || []); });
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (editId) { await adminApi.roles.update(editId, form); }
    else { await adminApi.roles.create(form); }
    setModalOpen(false);
    setForm({ name: '', code: '', description: '' });
    setEditId(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    await adminApi.roles.delete(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">角色管理</h1>
        <Button onClick={() => { setEditId(null); setForm({ name: '', code: '', description: '' }); setModalOpen(true); }}>新建角色</Button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-gray-50"><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">名称</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">编码</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">描述</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {roles.map((role) => (
              <tr key={role.id as number} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{role.name as string}</td>
                <td className="px-4 py-3 text-sm"><code className="bg-gray-100 px-2 py-0.5 rounded">{role.code as string}</code></td>
                <td className="px-4 py-3 text-sm text-gray-500">{(role.description as string) || '-'}</td>
                <td className="px-4 py-3 text-sm flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setForm({ name: role.name as string, code: role.code as string, description: (role.description as string) || '' }); setEditId(role.id as number); setModalOpen(true); }}>编辑</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(role.id as number)}>删除</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? '编辑角色' : '新建角色'}>
        <div className="space-y-4">
          <Input label="角色名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="角色编码" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="如 ADMIN, USER" />
          <Input label="描述" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button onClick={handleSave} className="w-full">保存</Button>
        </div>
      </Modal>
    </div>
  );
}
