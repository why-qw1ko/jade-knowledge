import Link from 'next/link';
import { cn } from '@/lib/utils';
import { truncateText, formatDate } from '@/lib/utils';
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
      <div className={cn('bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group', className)}>
        {/* Cover image */}
        <div className="h-48 bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center overflow-hidden">
          {article.coverImage ? (
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <span className="text-emerald-300 text-5xl">💎</span>
          )}
        </div>
        {/* Content */}
        <div className="p-4">
          {article.categoryName && (
            <Badge variant="green" className="mb-2">{article.categoryName}</Badge>
          )}
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{truncateText(article.summary, 80)}</p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-400">
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
