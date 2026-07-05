import { formatDateTime } from '@/lib/utils';
import { User } from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  status?: number;
  userName?: string;
  userAvatar?: string;
  createTime?: string;
  children?: Comment[];
}

interface CommentListProps {
  comments: Comment[];
}

function PendingBadge() {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{ backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}
    >
      审核中
    </span>
  );
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
        暂无评论，快来发表第一条评论吧
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-3">
          <div className={`flex gap-3 ${comment.status === 0 ? 'opacity-70' : ''}`}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--brand-light)' }}
            >
              <User className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {comment.userName || '匿名用户'}
                </span>
                {comment.status === 0 && <PendingBadge />}
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatDateTime(comment.createTime || '')}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{comment.content}</p>
            </div>
          </div>
          {/* Nested replies */}
          {comment.children && comment.children.length > 0 && (
            <div className="ml-12 space-y-3">
              {comment.children.map((reply) => (
                <div key={reply.id} className={`flex gap-3 ${reply.status === 0 ? 'opacity-70' : ''}`}>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    <User className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {reply.userName || '匿名用户'}
                      </span>
                      {reply.status === 0 && <PendingBadge />}
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDateTime(reply.createTime || '')}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
