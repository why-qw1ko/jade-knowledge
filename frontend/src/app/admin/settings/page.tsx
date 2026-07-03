'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { adminApi } from '@/lib/api';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    ai_provider: 'openai',
    ai_api_key: '',
    ai_model: 'gpt-4o',
    crawl_schedule: '0 0 3 * * ?',
    daily_publish_limit: '1',
    comment_audit_enabled: 'true',
    register_enabled: 'true',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.systemConfig.getAll().then((res: any) => {
      if (res.code === 200 && res.data) setForm((prev) => ({ ...prev, ...res.data }));
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try { await adminApi.systemConfig.update(form); alert('保存成功'); } finally { setSaving(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">系统配置</h1>
      <div className="space-y-6">
        <Card>
          <CardHeader><h3 className="font-semibold">AI 配置</h3></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AI 服务商</label>
              <select value={form.ai_provider} onChange={(e) => setForm({ ...form, ai_provider: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="openai">OpenAI</option>
                <option value="dashscope">通义千问</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </div>
            <Input label="API Key" type="password" value={form.ai_api_key} onChange={(e) => setForm({ ...form, ai_api_key: e.target.value })} />
            <Input label="模型名称" value={form.ai_model} onChange={(e) => setForm({ ...form, ai_model: e.target.value })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold">抓取配置</h3></CardHeader>
          <CardContent className="space-y-4">
            <Input label="定时抓取 Cron" value={form.crawl_schedule} onChange={(e) => setForm({ ...form, crawl_schedule: e.target.value })} placeholder="0 0 3 * * ?" />
            <Input label="每日发布上限" value={form.daily_publish_limit} onChange={(e) => setForm({ ...form, daily_publish_limit: e.target.value })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold">其他配置</h3></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开放注册</label>
              <select value={form.register_enabled} onChange={(e) => setForm({ ...form, register_enabled: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="true">是</option>
                <option value="false">否</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">评论审核</label>
              <select value={form.comment_audit_enabled} onChange={(e) => setForm({ ...form, comment_audit_enabled: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="true">开启</option>
                <option value="false">关闭</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} loading={saving}>保存所有配置</Button>
      </div>
    </div>
  );
}
