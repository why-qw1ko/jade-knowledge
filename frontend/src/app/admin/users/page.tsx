'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { adminApi } from '@/lib/api';
import { Users, Plus, Edit2, Trash2, Key, UserCheck, UserX, Shield } from 'lucide-react';

interface UserForm {
  username: string;
  nickname: string;
  email: string;
  phone: string;
  status: number;
}

const emptyForm: UserForm = { username: '', nickname: '', email: '', phone: '', status: 1 };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [roles, setRoles] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [formId, setFormId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<Record<string, unknown> | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<number>>(new Set());

  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdUserId, setPwdUserId] = useState<number | null>(null);
  const [pwdUsername, setPwdUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const load = () => {
    setLoading(true);
    const params: Record<string, unknown> = { pageNum: page, pageSize: 10 };
    if (keyword) params.keyword = keyword;
    adminApi.users.list(params).then((res: any) => {
      if (res.code === 200) { setUsers(res.data?.records || []); setTotal(res.data?.total || 0); }
    }).finally(() => setLoading(false));
  };

  const loadRoles = () => adminApi.roles.list().then((res: any) => { if (res.code === 200) setRoles(res.data || []); });

  useEffect(() => { load(); }, [page]);
  useEffect(() => { loadRoles(); }, []);

  const handleSearch = () => { setPage(1); load(); };

  // Create / Edit
  const openCreate = () => {
    setFormMode('create');
    setForm(emptyForm);
    setFormId(null);
    setFormOpen(true);
  };

  const openEdit = (user: Record<string, unknown>) => {
    setFormMode('edit');
    setForm({
      username: user.username as string,
      nickname: (user.nickname as string) || '',
      email: (user.email as string) || '',
      phone: (user.phone as string) || '',
      status: (user.status as number) ?? 1,
    });
    setFormId(user.id as number);
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (formMode === 'create' && !form.username.trim()) { alert('请输入用户名'); return; }
    setFormLoading(true);
    try {
      if (formMode === 'create') {
        await adminApi.users.create(form as unknown as Record<string, unknown>);
      } else {
        await adminApi.users.update(formId!, form as unknown as Record<string, unknown>);
      }
      setFormOpen(false);
      load();
    } catch (e: any) {
      alert(e?.message || '操作失败');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该用户？此操作不可恢复。')) return;
    try {
      await adminApi.users.delete(id);
      load();
    } catch (e: any) {
      alert(e?.message || '删除失败');
    }
  };

  // Enable / Disable
  const toggleStatus = async (user: Record<string, unknown>) => {
    const newStatus = user.status === 1 ? 0 : 1;
    try {
      await adminApi.users.update(user.id as number, { status: newStatus });
      load();
    } catch (e: any) {
      alert(e?.message || '操作失败');
    }
  };

  // Reset password
  const openResetPwd = (user: Record<string, unknown>) => {
    setPwdUserId(user.id as number);
    setPwdUsername(user.username as string);
    setNewPassword('');
    setPwdModalOpen(true);
  };

  const handleResetPwd = async () => {
    if (!newPassword.trim() || newPassword.length < 6) { alert('密码至少6位'); return; }
    setPwdLoading(true);
    try {
      await adminApi.users.resetPassword(pwdUserId!, newPassword);
      setPwdModalOpen(false);
      alert('密码重置成功');
    } catch (e: any) {
      alert(e?.message || '重置失败');
    } finally {
      setPwdLoading(false);
    }
  };

  // Assign roles
  const openRoleModal = (user: Record<string, unknown>) => {
    setEditUser(user);
    const userRoles = (user.roles as string[]) || [];
    const roleIds = roles.filter(r => userRoles.includes(r.code as string)).map(r => r.id as number);
    setSelectedRoleIds(new Set(roleIds));
    setRoleModalOpen(true);
  };

  const toggleRole = (id: number) => {
    const next = new Set(selectedRoleIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRoleIds(next);
  };

  const handleSaveRoles = async () => {
    if (!editUser) return;
    try {
      await adminApi.users.assignRoles(editUser.id as number, Array.from(selectedRoleIds));
      setRoleModalOpen(false);
      load();
    } catch (e: any) {
      alert(e?.message || '分配角色失败');
    }
  };

  const columns = [
    { key: 'username', title: '用户名' },
    { key: 'nickname', title: '昵称', render: (v: unknown) => String(v || '-') },
    { key: 'email', title: '邮箱', render: (v: unknown) => String(v || '-') },
    { key: 'phone', title: '手机号', render: (v: unknown) => String(v || '-') },
    { key: 'roles', title: '角色', render: (v: unknown) => (v as string[])?.map((r: string) => <Badge key={r} variant="blue">{r}</Badge>) || <span className="text-gray-400">-</span> },
    { key: 'status', title: '状态', render: (v: unknown) => <Badge variant={v === 1 ? 'green' : 'red'}>{v === 1 ? '正常' : '禁用'}</Badge> },
    { key: 'createTime', title: '注册时间' },
    {
      key: 'actions', title: '操作', render: (_: unknown, record: Record<string, unknown>) => (
        <div className="flex gap-1 flex-wrap">
          <Button size="sm" variant="ghost" onClick={() => openEdit(record)} title="编辑">
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openRoleModal(record)} title="分配角色">
            <Shield className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openResetPwd(record)} title="重置密码">
            <Key className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toggleStatus(record)} title={record.status === 1 ? '禁用' : '启用'}>
            {record.status === 1 ? <UserX className="w-3.5 h-3.5" style={{ color: 'var(--status-warning)' }} /> : <UserCheck className="w-3.5 h-3.5" style={{ color: 'var(--brand-primary)' }} />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(record.id as number)} title="删除">
            <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-danger)' }} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full p-4 md:p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>用户管理</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" />新建用户
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          total={total}
          page={page}
          onPageChange={setPage}
          onSearch={(kw) => { setKeyword(kw); setPage(1); load(); }}
          searchPlaceholder="搜索用户名/昵称/邮箱..."
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={formMode === 'create' ? '新建用户' : '编辑用户'}
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
          {formMode === 'create' && (
            <>
              <Input label="用户名 *" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="请输入用户名" />
              <p className="text-xs text-gray-500 -mt-2">默认密码为 123456，创建后可重置</p>
            </>
          )}
          <Input label="昵称" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="请输入昵称" />
          <Input label="邮箱" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="请输入邮箱" />
          <Input label="手机号" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="请输入手机号" />
          <Select
            label="状态"
            value={String(form.status)}
            onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
            options={[{ value: 1, label: '正常' }, { value: 0, label: '禁用' }]}
          />
        </div>
      </Modal>

      {/* Assign Roles Modal */}
      <Modal
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={`分配角色 - ${editUser?.username || ''}`}
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setRoleModalOpen(false)} className="flex-1">取消</Button>
            <Button onClick={handleSaveRoles} className="flex-1">保存</Button>
          </div>
        }
      >
        <div className="space-y-2">
          {roles.map((role) => (
            <label key={role.id as number} className="flex items-center gap-2.5 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRoleIds.has(role.id as number)}
                onChange={() => toggleRole(role.id as number)}
                className="rounded border-gray-300 focus:ring-[var(--brand-primary)]"
                style={{ color: 'var(--brand-primary)' }}
              />
              <span className="text-sm font-medium">{role.name as string}</span>
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{role.code as string}</code>
              <span className="text-xs text-gray-400">{(role.description as string) || ''}</span>
            </label>
          ))}
          {roles.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">暂无角色，请先创建角色</p>}
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        open={pwdModalOpen}
        onClose={() => setPwdModalOpen(false)}
        title={`重置密码 - ${pwdUsername}`}
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setPwdModalOpen(false)} className="flex-1">取消</Button>
            <Button onClick={handleResetPwd} loading={pwdLoading} className="flex-1">确认重置</Button>
          </div>
        }
      >
        <Input
          label="新密码"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="请输入新密码（至少6位）"
        />
      </Modal>
    </div>
  );
}
