'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { FolderOpen, Edit2, Trash2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', parentId: '', sort: '0', description: '' });
  const [editId, setEditId] = useState<number | null>(null);

  const load = () => adminApi.categories.list().then((res: any) => { if (res.code === 200) setCategories(res.data || []); });
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const data = { ...form, parentId: form.parentId ? Number(form.parentId) : 0, sort: Number(form.sort) };
    if (editId) {
      await adminApi.categories.update(editId, data);
    } else {
      await adminApi.categories.create(data);
    }
    setModalOpen(false);
    setForm({ name: '', parentId: '', sort: '0', description: '' });
    setEditId(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    await adminApi.categories.delete(id);
    load();
  };

  const openEdit = (cat: Record<string, unknown>) => {
    setForm({ name: cat.name as string, parentId: cat.parentId ? String(cat.parentId) : '', sort: String(cat.sort || 0), description: (cat.description as string) || '' });
    setEditId(cat.id as number);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-8 overflow-hidden">
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
            <h1 className="text-2xl font-semibold">分类管理</h1>
          </div>
          <Button onClick={() => { setEditId(null); setForm({ name: '', parentId: '', sort: '0', description: '' }); setModalOpen(true); }}>新建分类</Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50"><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">名称</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">排序</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">描述</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id as number} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{(cat as Record<string, unknown>).parentId ? '  └ ' : ''}{cat.name as string}</td>
                  <td className="px-4 py-3 text-sm">{cat.sort as number}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{(cat.description as string) || '-'}</td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(cat)} title="编辑">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(cat.id as number)} title="删除">
                      <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-danger)' }} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? '编辑分类' : '新建分类'}
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">取消</Button>
            <Button onClick={handleSave} className="flex-1">保存</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="分类名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="父分类ID" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} placeholder="0为顶级分类" />
          <Input label="排序" value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value })} />
          <Input label="描述" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
