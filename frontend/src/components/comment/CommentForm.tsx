'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { commentsApi } from '@/lib/api';

interface CommentFormProps {
  articleId: number;
  onSuccess?: () => void;
}

export function CommentForm({ articleId, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('请输入评论内容');
      return;
    }
    if (content.length > 500) {
      setError('评论内容不能超过500字');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await commentsApi.create(articleId, { content: content.trim() });
      setContent('');
      setSuccess('评论发表成功');
      onSuccess?.();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      if (e?.code === 401) {
        setError('请先登录后再评论');
      } else {
        setError((e?.message as string) || '评论发表失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setError(''); setSuccess(''); }}
        placeholder="写下你的评论..."
        className="w-full p-3 rounded-lg text-sm resize-none focus:outline-none min-h-[100px]"
        style={{
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-focus)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-primary)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        maxLength={500}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{content.length}/500</span>
          {success && <span className="text-xs" style={{ color: 'var(--status-success)' }}>{success}</span>}
          {error && <span className="text-xs" style={{ color: 'var(--status-danger)' }}>{error}</span>}
        </div>
        <Button size="sm" onClick={handleSubmit} loading={loading}>发表评论</Button>
      </div>
    </div>
  );
}
