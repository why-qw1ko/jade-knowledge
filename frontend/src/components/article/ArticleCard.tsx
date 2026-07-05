import Link from 'next/link';
import { cn } from '@/lib/utils';
import { truncateText, formatDate } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/api';
import { Eye, User } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ArticleCardProps {
  article: {
    id: number;
    title: string;
    summary?: string;
    coverImage?: string;
    categoryName?: string;
    authorName?: string;
    viewCount?: number;
    createTime?: string;
  };
  className?: string;
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.id}`}>
      <div
        className={cn('rounded-xl overflow-hidden transition-all duration-300 group h-[360px] flex flex-col hover:shadow-lg hover:-translate-y-1', className)}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Cover image */}
        <div
          className="h-44 flex items-center justify-center overflow-hidden shrink-0"
          style={{ backgroundColor: 'var(--brand-light)' }}
        >
          <img
            src={resolveImageUrl(article.coverImage) || resolveImageUrl('/upload/default.png')}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={(e) => { (e.target as HTMLImageElement).src = resolveImageUrl('/upload/default.png'); }}
          />
        </div>
        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between min-h-0">
          <div className="min-h-0">
            {article.categoryName && (
              <Badge variant="green" className="mb-2">{article.categoryName}</Badge>
            )}
            <h3
              className="font-semibold mb-1.5 group-hover:text-[var(--brand-primary)] transition-colors line-clamp-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {article.title}
            </h3>
            {article.summary && (
              <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {truncateText(article.summary, 80)}
              </p>
            )}
          </div>
          <div
            className="flex items-center justify-between text-xs pt-2 shrink-0"
            style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-secondary)' }}
          >
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{article.authorName || '匿名'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.viewCount || 0}</span>
              <span>{formatDate(article.createTime || '')}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
