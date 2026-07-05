'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { adminApi } from '@/lib/api';
import { Bot, Globe, MessageSquare, Settings, Search, Loader2, CheckCircle, XCircle } from 'lucide-react';

const AI_PROVIDERS = [
  { value: 'deepseek', label: 'DeepSeek', url: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat' },
  { value: 'dashscope', label: '通义千问 (阿里)', url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', model: 'qwen-plus' },
  { value: 'zhipu', label: '智谱 GLM (ChatGLM)', url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-flash' },
  { value: 'doubao', label: '豆包 (字节跳动)', url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', model: 'doubao-pro-32k' },
  { value: 'ernie', label: '文心一言 (百度)', url: 'https://qianfan.baidubce.com/v2/chat/completions', model: 'ernie-4.0-8k' },
  { value: 'kimi', label: 'Kimi (月之暗面)', url: 'https://api.moonshot.cn/v1/chat/completions', model: 'moonshot-v1-8k' },
  { value: 'baichuan', label: '百川智能', url: 'https://api.baichuan-ai.com/v1/chat/completions', model: 'Baichuan4' },
  { value: 'minimax', label: 'MiniMax', url: 'https://api.minimax.chat/v1/text/chatcompletion_v2', model: 'abab6.5-chat' },
  { value: 'spark', label: '讯飞星火', url: 'https://spark-api-open.xf-yun.com/v1/chat/completions', model: 'generalv3.5' },
  { value: 'yi', label: '零一万物 (Yi)', url: 'https://api.lingyiwanwu.com/v1/chat/completions', model: 'yi-large' },
  { value: 'openai', label: 'OpenAI', url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o' },
  { value: 'mimo-openai', label: '小米 MiMo (OpenAI 协议)', url: 'https://api.xiaomimimo.com/v1/chat/completions', model: 'MiMo-v2.5-Pro' },
  { value: 'mimo-anthropic', label: '小米 MiMo (Anthropic 协议)', url: 'https://api.xiaomimimo.com/anthropic/v1/messages', model: 'MiMo-v2.5-Pro' },
];

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    ai_provider: 'deepseek',
    ai_api_url: '',
    ai_api_key: '',
    ai_model: '',
    crawl_schedule: '0 0 3 * * ?',
    daily_publish_limit: '1',
    comment_audit_enabled: 'true',
    register_enabled: 'true',
    banner_enabled: 'false',
  });
  const [saving, setSaving] = useState(false);
  const [esStatus, setEsStatus] = useState<boolean | null>(null);
  const [esSyncing, setEsSyncing] = useState(false);
  const [esSyncResult, setEsSyncResult] = useState<string | null>(null);

  useEffect(() => {
    adminApi.systemConfig.getAll().then((res: any) => {
      if (res.code === 200 && res.data) {
        setForm((prev) => ({ ...prev, ...res.data }));
      }
    });
    adminApi.searchManage.status().then((res: any) => {
      if (res.code === 200) setEsStatus(res.data?.esAvailable ?? false);
    }).catch(() => setEsStatus(false));
  }, []);

  const handleProviderChange = (provider: string) => {
    const p = AI_PROVIDERS.find(pr => pr.value === provider);
    setForm({
      ...form,
      ai_provider: provider,
      ai_api_url: p?.url || '',
      ai_model: p?.model || '',
    });
  };

  const handleEsSync = async () => {
    setEsSyncing(true);
    setEsSyncResult(null);
    try {
      const res: any = await adminApi.searchManage.sync();
      if (res.code === 200) {
        const { synced, esAvailable } = res.data;
        setEsStatus(esAvailable);
        setEsSyncResult(esAvailable ? `同步成功，共 ${synced} 篇文章` : 'Elasticsearch 不可用，已降级为 MySQL 搜索');
      }
    } catch {
      setEsSyncResult('同步失败，请检查 Elasticsearch 服务');
    } finally {
      setEsSyncing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try { await adminApi.systemConfig.update(form); alert('保存成功'); } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-8 overflow-hidden">
      <div className="flex items-center gap-2 mb-6 flex-shrink-0">
        <Settings className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
        <h1 className="text-2xl font-semibold">系统配置</h1>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
              <h3 className="font-semibold">AI 配置</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Select
                label="AI 服务商"
                value={form.ai_provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                options={AI_PROVIDERS.map((p) => ({ value: p.value, label: p.label }))}
              />
              <p className="mt-1 text-xs text-gray-400">选择服务商后会自动填入 API 地址和默认模型</p>
            </div>
            <Input label="API 地址" value={form.ai_api_url} onChange={(e) => setForm({ ...form, ai_api_url: e.target.value })}
              placeholder="https://api.example.com/v1/chat/completions" />
            <Input label="API Key" type="password" value={form.ai_api_key} onChange={(e) => setForm({ ...form, ai_api_key: e.target.value })}
              placeholder="sk-..." />
            <Input label="模型名称" value={form.ai_model} onChange={(e) => setForm({ ...form, ai_model: e.target.value })}
              placeholder="deepseek-chat" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
              <h3 className="font-semibold">抓取配置</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="定时抓取 Cron" value={form.crawl_schedule} onChange={(e) => setForm({ ...form, crawl_schedule: e.target.value })}
              placeholder="0 0 3 * * ?" />
            <Input label="每日发布上限" value={form.daily_publish_limit} onChange={(e) => setForm({ ...form, daily_publish_limit: e.target.value })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
              <h3 className="font-semibold">其他配置</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="开放注册"
              value={form.register_enabled}
              onChange={(e) => setForm({ ...form, register_enabled: e.target.value })}
              options={[{ value: 'true', label: '是' }, { value: 'false', label: '否' }]}
            />
            <Select
              label="评论审核"
              value={form.comment_audit_enabled}
              onChange={(e) => setForm({ ...form, comment_audit_enabled: e.target.value })}
              options={[{ value: 'true', label: '开启' }, { value: 'false', label: '关闭' }]}
            />
            <div>
              <Select
                label="首页轮播图"
                value={form.banner_enabled}
                onChange={(e) => setForm({ ...form, banner_enabled: e.target.value })}
                options={[
                  { value: 'true', label: '开启（显示轮播图）' },
                  { value: 'false', label: '关闭（显示默认Hero）' },
                ]}
              />
              <p className="mt-1 text-xs text-gray-400">开启后首页将展示轮播图替代默认的Hero区域，需先在「轮播图管理」中添加图片</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
              <h3 className="font-semibold">Elasticsearch 搜索</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>状态：</span>
              {esStatus === null ? (
                <span style={{ color: 'var(--text-muted)' }}>检测中...</span>
              ) : esStatus ? (
                <span className="flex items-center gap-1" style={{ color: 'var(--status-success)' }}>
                  <CheckCircle className="w-4 h-4" />已连接
                </span>
              ) : (
                <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <XCircle className="w-4 h-4" />未启用（使用 MySQL 搜索）
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              启用 ES 需在环境变量中设置 <code>ES_ENABLED=true</code> 和 <code>ES_URIS=http://localhost:9200</code>，然后点击同步按钮建立索引。
            </p>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={handleEsSync} disabled={esSyncing}>
                {esSyncing ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Search className="w-4 h-4 mr-1.5" />}
                {esSyncing ? '同步中...' : '全量同步索引'}
              </Button>
              {esSyncResult && (
                <span className="text-sm" style={{ color: esSyncResult.includes('成功') ? 'var(--status-success)' : 'var(--status-danger)' }}>
                  {esSyncResult}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} loading={saving}>保存所有配置</Button>
        </div>
      </div>
    </div>
  );
}
