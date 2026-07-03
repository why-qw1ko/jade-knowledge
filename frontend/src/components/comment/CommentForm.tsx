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
    try {
      await commentsApi.create(articleId, { content: content.trim() });
      setContent('');
      onSuccess?.();
    } catch {
      setError('评论发表失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setError(''); }}
        placeholder="写下你的评论..."
        className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
        maxLength={500}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{content.length}/500</span>
        <Button size="sm" onClick={handleSubmit} loading={loading}>发表评论</Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
