'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { Shield, Edit2, Key, Trash2 } from 'lucide-react';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Record<string, unknown>[]>([]);
  const [permissions, setPermissions] = useState<Record<string, unknown>[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [permRoleId, setPermRoleId] = useState<number | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(new Set());

  const load = () => adminApi.roles.list().then((res: any) => { if (res.code === 200) setRoles(res.data || []); });
  const loadPermissions = () => adminApi.permissions.list().then((res: any) => { if (res.code === 200) setPermissions(res.data || []); });

  useEffect(() => { load(); loadPermissions(); }, []);

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

  const openPermModal = async (roleId: number) => {
    setPermRoleId(roleId);
    // 加载角色已有权限
    const res: any = await adminApi.roles.getPermissions(roleId);
    const existingIds = res.code === 200 ? (res.data || []).map((p: Record<string, unknown>) => p.id) : [];
    setSelectedPermIds(new Set(existingIds));
    setPermModalOpen(true);
  };

  const togglePerm = (id: number) => {
    const next = new Set(selectedPermIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPermIds(next);
  };

  const handleSavePerms = async () => {
    if (permRoleId == null) return;
    await adminApi.roles.assignPermissions(permRoleId, Array.from(selectedPermIds));
    setPermModalOpen(false);
  };

  // 按 parentId 分组
  const parentPerms = permissions.filter(p => !p.parentId || p.parentId === 0);
  const getChildren = (parentId: number) => permissions.filter(p => p.parentId === parentId);

  return (
    <div className="flex flex-col h-full p-4 md:p-8 overflow-hidden">
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
            <h1 className="text-2xl font-semibold">角色管理</h1>
          </div>
          <Button onClick={() => { setEditId(null); setForm({ name: '', code: '', description: '' }); setModalOpen(true); }}>新建角色</Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
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
                    <Button size="sm" variant="ghost" onClick={() => { setForm({ name: role.name as string, code: role.code as string, description: (role.description as string) || '' }); setEditId(role.id as number); setModalOpen(true); }} title="编辑">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openPermModal(role.id as number)} title="分配权限">
                      <Key className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(role.id as number)} title="删除">
                      <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-danger)' }} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 角色编辑模态框 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? '编辑角色' : '新建角色'}
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">取消</Button>
            <Button onClick={handleSave} className="flex-1">保存</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="角色名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="角色编码" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="如 ADMIN, USER" />
          <Input label="描述" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>

      {/* 权限分配模态框 */}
      <Modal
        open={permModalOpen}
        onClose={() => setPermModalOpen(false)}
        title="分配权限"
        className="max-w-md"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setPermModalOpen(false)} className="flex-1">取消</Button>
            <Button onClick={handleSavePerms} className="flex-1">保存</Button>
          </div>
        }
      >
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {parentPerms.map((perm) => (
            <div key={perm.id as number} className="py-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPermIds.has(perm.id as number)}
                  onChange={() => togglePerm(perm.id as number)}
                  className="rounded border-gray-300 focus:ring-[var(--brand-primary)]"
                  style={{ color: 'var(--brand-primary)' }}
                />
                <span className="text-sm font-medium">{perm.name as string}</span>
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{perm.code as string}</code>
              </label>
              {getChildren(perm.id as number).length > 0 && (
                <div className="pl-7 mt-1 space-y-1">
                  {getChildren(perm.id as number).map((child) => (
                    <label key={child.id as number} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPermIds.has(child.id as number)}
                        onChange={() => togglePerm(child.id as number)}
                        className="rounded border-gray-300 focus:ring-[var(--brand-primary)]"
                        style={{ color: 'var(--brand-primary)' }}
                      />
                      <span className="text-sm text-gray-600">{child.name as string}</span>
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{child.code as string}</code>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
          {permissions.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">暂无权限数据</p>}
        </div>
      </Modal>
    </div>
  );
}
