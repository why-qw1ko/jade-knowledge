'use client';

import { useEffect, useState, useRef } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Sparkles, CheckCircle, XCircle, History, Loader2, Edit3, Wand2, X, Copy, Check,
  Trash2, Eye, ChevronDown, ChevronUp, Lightbulb, RotateCcw,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type Tab = 'all' | 'pending' | 'approved' | 'rejected' | 'published';

const tabs: { key: Tab; label: string; status?: number }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核', status: 0 },
  { key: 'approved', label: '已通过', status: 1 },
  { key: 'rejected', label: '已拒绝', status: 2 },
  { key: 'published', label: '已转草稿', status: 3 },
];

const statusMap: Record<number, { label: string; variant: 'yellow' | 'green' | 'red' | 'gray' }> = {
  0: { label: '待审核', variant: 'yellow' },
  1: { label: '已通过', variant: 'green' },
  2: { label: '已拒绝', variant: 'red' },
  3: { label: '已转草稿', variant: 'gray' },
};

const PRESET_PROMPTS = [
  '翡翠冰种和糯种的区别',
  '和田玉的保养方法',
  '如何鉴别真假翡翠',
  '翡翠手镯选购指南',
  '玉石雕刻工艺介绍',
  '翡翠投资收藏建议',
];

export default function AdminCrawlPage() {
  const router = useRouter();
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [actingId, setActingId] = useState<number | null>(null);

  // SSE streaming state
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [streamDone, setStreamDone] = useState(false);
  const [streamResultId, setStreamResultId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  // Task history modal
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState<Record<string, unknown>[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Content preview modal
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    const tabDef = tabs.find((t) => t.key === tab)!;
    const params: Record<string, unknown> = { pageNum: page, pageSize: 10 };
    if (tabDef.status !== undefined) params.status = tabDef.status;
    adminApi.crawl.listResults(params).then((res: any) => {
      if (res.code === 200) { setResults(res.data?.records || []); setTotal(res.data?.total || 0); }
    }).finally(() => { if (!silent) setLoading(false); });
  };

  const loadTasks = () => {
    setTasksLoading(true);
    adminApi.crawl.listTasks({ pageNum: 1, pageSize: 50 }).then((res: any) => {
      if (res.code === 200) { setTasks(res.data?.records || []); }
    }).finally(() => setTasksLoading(false));
  };

  useEffect(() => { setPage(1); }, [tab]);
  useEffect(() => { load(); }, [page, tab]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [streamContent]);

  const handleGenerate = async () => {
    if (!prompt.trim() || streaming) return;
    setStreaming(true);
    setStreamContent('');
    setStreamDone(false);
    setStreamResultId(null);
    doneRef.current = false;

    const token = localStorage.getItem('token');
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/api/admin/crawl/generate/stream?prompt=${encodeURIComponent(prompt.trim())}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.substring(6).trim();
            continue;
          }
          if (line.startsWith('data:')) {
            const data = line.substring(5).trim();
            if (!data) continue;

            try {
              const parsed = JSON.parse(data);
              const text = typeof parsed === 'string' ? parsed : String(parsed);

              if (currentEvent === 'chunk') {
                const clean = text.replace(/\0/g, '').replace(/\\u0000/g, '');
                if (clean) setStreamContent(prev => prev + clean);
              } else if (currentEvent === 'done') {
                setStreamResultId(Number(parsed));
                setStreamDone(true);
                doneRef.current = true;
              } else if (currentEvent === 'error') {
                setStreamContent(prev => prev + '\n\n[错误: ' + text + ']');
                setStreamDone(true);
              }
            } catch {
              if (currentEvent === 'chunk') {
                setStreamContent(prev => prev + data.replace(/\0/g, ''));
              }
            }
            currentEvent = '';
          }
        }
      }

      // 流正常结束但没收到 done 事件 — 连接被中间代理断开
      setStreamDone(true);
      setStreamResultId(prev => {
        if (prev === null) {
          setStreamContent(c => c + '\n\n[连接中断] 内容可能未完整保存，请检查任务历史或重试');
        }
        return prev;
      });
    } catch (err: any) {
      if (err.name !== 'AbortError' && !doneRef.current) {
        const msg = err.message?.includes('401') ? '未授权，请重新登录'
          : err.message?.includes('403') ? '无权限访问'
          : err.message?.includes('Failed to fetch') ? '无法连接到服务器，请检查后端是否运行'
          : err.message || '未知错误';
        setStreamContent(prev => prev + '\n\n[连接失败: ' + msg + ']');
        setStreamDone(true);
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      setStreaming(false);
      setStreamDone(true);
    }
  };

  const handleClosePreview = () => {
    setStreamContent('');
    setStreamDone(false);
    setStreamResultId(null);
    setCopied(false);
    if (streaming) handleStop();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(streamContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'publish') => {
    setActingId(id);
    try {
      if (action === 'approve') await adminApi.crawl.approve(id);
      else if (action === 'reject') await adminApi.crawl.reject(id);
      else {
        const res: any = await adminApi.crawl.publish(id);
        if (res.code === 200 && res.data) {
          router.push(`/admin/articles/${res.data}/edit?from=ai`);
          return;
        }
      }
      load(true);
    } finally {
      setActingId(null);
    }
  };

  const handlePublishGenerated = async () => {
    if (!streamResultId) return;
    setActingId(streamResultId);
    try {
      const res: any = await adminApi.crawl.publish(streamResultId);
      if (res.code === 200 && res.data) {
        router.push(`/admin/articles/${res.data}/edit?from=ai`);
      }
    } catch {
      // silent
    } finally {
      setActingId(null);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('确定删除该任务？')) return;
    try {
      await adminApi.crawl.deleteTask(id);
      loadTasks();
    } catch {
      // silent
    }
  };

  const openTasks = () => {
    loadTasks();
    setShowTasks(true);
  };

  const handlePresetClick = (text: string) => {
    setPrompt(text);
  };

  const wordCount = streamContent.replace(/\s/g, '').length;

  const columns = [
    { key: 'title', title: '标题', render: (v: unknown, record: Record<string, unknown>) => (
      <button
        className="line-clamp-1 max-w-xs block font-medium text-left hover:underline"
        style={{ color: 'var(--brand-primary)' }}
        onClick={() => { setPreviewTitle(String(v || '-')); setPreviewContent(String(record.cleanContent || record.content || '')); }}
        title="点击查看内容"
      >
        {String(v || '-')}
      </button>
    )},
    { key: 'source', title: '来源', render: (v: unknown) => {
      const val = String(v || '-');
      const isAI = val === 'AI生成';
      return <span style={{ color: isAI ? 'var(--brand-primary)' : 'var(--text-muted)' }}>{isAI ? <Wand2 className="w-3.5 h-3.5 inline mr-1" /> : null}{val}</span>;
    }},
    { key: 'status', title: '状态', width: '100px', render: (v: unknown) => {
      const s = statusMap[v as number];
      return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(v);
    }},
    { key: 'createTime', title: '创建时间', render: (v: unknown) => formatDateTime(String(v)) },
    { key: 'actions', title: '操作', render: (_: unknown, record: Record<string, unknown>) => {
      const id = record.id as number;
      const busy = actingId === id;
      return (
        <div className="flex gap-1 items-center">
          <Button size="sm" variant="ghost" onClick={() => { setPreviewTitle(String(record.title || '-')); setPreviewContent(String(record.cleanContent || record.content || '')); }} title="预览">
            <Eye className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          </Button>
          {record.status === 0 && (
            <>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleAction(id, 'approve')} title="通过">
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--status-success)' }} />}
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleAction(id, 'reject')} title="拒绝">
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--status-danger)' }} />}
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleAction(id, 'publish')} title="编辑并发布">
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" style={{ color: 'var(--status-info)' }} />}
              </Button>
            </>
          )}
          {record.status === 1 && (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleAction(id, 'publish')} title="编辑并发布">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" style={{ color: 'var(--status-info)' }} />}
            </Button>
          )}
        </div>
      );
    }},
  ];

  const taskColumns = [
    { key: 'name', title: '任务名称', render: (v: unknown) => <span className="font-medium line-clamp-1 max-w-xs block">{String(v || '-')}</span> },
    { key: 'status', title: '状态', render: (v: unknown) => {
      // 0-待执行 1-执行中 2-已完成 3-失败
      const statusMap: Record<number, { label: string; variant: 'yellow' | 'blue' | 'green' | 'red' }> = {
        0: { label: '待执行', variant: 'yellow' },
        1: { label: '执行中', variant: 'blue' },
        2: { label: '已完成', variant: 'green' },
        3: { label: '失败', variant: 'red' },
      };
      const s = statusMap[v as number] || { label: '未知', variant: 'gray' as const };
      return <Badge variant={s.variant}>{s.label}</Badge>;
    }},
    { key: 'runCount', title: '执行次数', render: (v: unknown) => String(v ?? 0) },
    { key: 'createTime', title: '创建时间', render: (v: unknown) => formatDateTime(String(v)) },
    { key: 'actions', title: '操作', render: (_: unknown, record: Record<string, unknown>) => (
      <Button size="sm" variant="ghost" onClick={() => handleDeleteTask(record.id as number)} title="删除">
        <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--status-danger)' }} />
      </Button>
    )},
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 p-4 md:p-8 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
            <h1 className="text-2xl font-semibold">AI增效</h1>
          </div>
          <Button variant="secondary" size="sm" onClick={openTasks}>
            <History className="w-4 h-4 mr-1.5" />任务历史
          </Button>
        </div>

        {/* Input section */}
        <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--brand-light)', border: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--brand-text)' }}>AI智能生成文章</span>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>输入提示词，AI将实时生成完整的玉石知识文章</p>
          <div className="flex gap-3 mb-3">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !streaming && handleGenerate()}
              placeholder="如：翡翠冰种和糯种的区别..."
              className="flex-1 px-4 py-2.5 rounded-lg text-sm focus:outline-none"
              style={{ border: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              disabled={streaming}
            />
            {streaming ? (
              <Button variant="danger" onClick={handleStop}>
                <X className="w-4 h-4 mr-1.5" />停止
              </Button>
            ) : (
              <Button onClick={handleGenerate} disabled={!prompt.trim()}>
                <Sparkles className="w-4 h-4 mr-1.5" />生成
              </Button>
            )}
          </div>
          {/* Preset prompts */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            {PRESET_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handlePresetClick(p)}
                disabled={streaming}
                className="px-2.5 py-1 rounded-md text-xs transition-colors"
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.color = 'var(--brand-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-secondary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Streaming preview — collapsible card */}
        {streamContent && (
          <div className="rounded-xl mb-4 overflow-hidden" style={{ border: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-3">
                {streaming && <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--brand-primary)' }} />}
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {streaming ? 'AI正在生成中...' : streamDone ? '生成完成' : ''}
                </span>
                {streamContent && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {wordCount} 字
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!streaming && streamContent && (
                  <Button size="sm" variant="ghost" onClick={handleCopy} title="复制内容">
                    {copied ? <Check className="w-4 h-4" style={{ color: 'var(--status-success)' }} /> : <Copy className="w-4 h-4" />}
                  </Button>
                )}
                {streamDone && streamResultId && (
                  <Button size="sm" onClick={handlePublishGenerated} disabled={actingId === streamResultId}>
                    {actingId === streamResultId ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Edit3 className="w-3.5 h-3.5 mr-1" />}
                    {actingId === streamResultId ? '创建中...' : '编辑并发布'}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleClosePreview} title="关闭">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div ref={contentRef} className="p-4 max-h-60 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
              {streamContent}
              {streaming && <span className="inline-block w-2 h-4 ml-0.5 animate-pulse" style={{ backgroundColor: 'var(--brand-primary)' }} />}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
              style={tab === t.key
                ? { borderBottomColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }
                : { borderBottomColor: 'transparent', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { if (tab !== t.key) e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={(e) => { if (tab !== t.key) e.currentTarget.style.color = 'var(--text-muted)'; }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results table */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 md:px-8 pb-4 md:pb-8">
        <DataTable columns={columns} data={results} loading={loading} total={total} page={page} onPageChange={setPage} />
      </div>

      {/* Task history modal */}
      {showTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col mx-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <h2 className="text-lg font-semibold">任务历史</h2>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setShowTasks(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 p-4">
              <DataTable columns={taskColumns} data={tasks} loading={tasksLoading} />
            </div>
          </div>
        </div>
      )}

      {/* Content preview modal */}
      {previewContent !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <h2 className="text-base font-semibold line-clamp-1" style={{ color: 'var(--text-primary)' }}>{previewTitle}</h2>
              <Button size="sm" variant="ghost" onClick={() => setPreviewContent(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 p-5">
              <pre className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                {previewContent}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
