'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  const insertMarkdown = (prefix: string, suffix = '') => {
    const el = document.querySelector('.md-editor-textarea') as HTMLTextAreaElement;
    if (!el) { onChange(value + prefix + suffix); return; }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);
    const newText = value.substring(0, start) + prefix + selected + suffix + value.substring(end);
    onChange(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const toolbarBtns = [
    { label: 'B', action: () => insertMarkdown('**', '**'), className: 'font-bold', title: '加粗' },
    { label: 'I', action: () => insertMarkdown('*', '*'), className: 'italic', title: '斜体' },
    { label: 'H2', action: () => insertMarkdown('## '), className: 'font-semibold', title: '标题' },
    { label: 'H3', action: () => insertMarkdown('### '), className: '', title: '标题' },
    { label: 'divider' },
    { label: '• 列表', action: () => insertMarkdown('- '), className: '', title: '无序列表' },
    { label: '1. 列表', action: () => insertMarkdown('1. '), className: '', title: '有序列表' },
    { label: '❝ 引用', action: () => insertMarkdown('> '), className: '', title: '引用' },
    { label: '</>', action: () => insertMarkdown('```\n', '\n```'), className: 'font-mono', title: '代码块' },
    { label: 'divider' },
    { label: '🔗', action: () => insertMarkdown('[', '](url)'), className: '', title: '链接' },
    { label: '🖼️', action: () => insertMarkdown('![alt](', ')'), className: '', title: '图片' },
  ];

  return (
    <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border-primary)' }}>
      {/* Toolbar */}
      <div
        className="px-3 py-2 flex items-center gap-1"
        style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}
      >
        {toolbarBtns.map((btn, i) =>
          btn.label === 'divider' ? (
            <div key={i} className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--border-primary)' }} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={btn.action}
              className={`px-2 py-1 text-sm rounded transition-colors ${btn.className}`}
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              title={btn.title}
            >
              {btn.label}
            </button>
          )
        )}

        <div className="flex-1" />

        <div className="flex rounded-md p-0.5" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          {(['edit', 'preview'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="px-3 py-1 text-xs font-medium rounded-md transition-colors"
              style={
                tab === t
                  ? { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              {t === 'edit' ? '编辑' : '预览'}
            </button>
          ))}
        </div>
      </div>

      {/* Editor / Preview */}
      {tab === 'edit' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || '输入 Markdown 内容...'}
          className="md-editor-textarea w-full min-h-[400px] p-4 text-sm font-mono focus:outline-none resize-y"
          style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
        />
      ) : (
        <div className="min-h-[400px] p-4 overflow-auto" style={{ backgroundColor: 'var(--bg-input)' }}>
          {value ? (
            <div className="prose prose-sm prose-emerald max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>暂无内容，先去编辑吧</p>
          )}
        </div>
      )}
    </div>
  );
}
