import { formatDateTime } from '@/lib/utils';
import { User } from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  userName?: string;
  userAvatar?: string;
  createTime?: string;
  children?: Comment[];
}

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-gray-400 text-center py-8">暂无评论，快来发表第一条评论吧</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-3">
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{comment.userName || '匿名用户'}</span>
                <span className="text-xs text-gray-400">{formatDateTime(comment.createTime || '')}</span>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          </div>
          {/* Nested replies */}
          {comment.children && comment.children.length > 0 && (
            <div className="ml-12 space-y-3">
              {comment.children.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{reply.userName || '匿名用户'}</span>
                      <span className="text-xs text-gray-400">{formatDateTime(reply.createTime || '')}</span>
                    </div>
                    <p className="text-sm text-gray-700">{reply.content}</p>
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
