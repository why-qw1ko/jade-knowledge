import { ArticleCard } from './ArticleCard';
import { ArticleSkeleton } from '@/components/ui/Loading';
import { FileText } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  summary?: string;
  coverImage?: string;
  categoryName?: string;
  authorName?: string;
  viewCount?: number;
  createTime?: string;
}

interface ArticleListProps {
  articles: Article[];
  loading?: boolean;
}

export function ArticleList({ articles, loading }: ArticleListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-2"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <FileText className="w-10 h-10" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
        </div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>暂无文章</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>换个分类看看，或者稍后再来</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
