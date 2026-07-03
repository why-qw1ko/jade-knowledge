import { ArticleCard } from './ArticleCard';
import { ArticleSkeleton } from '@/components/ui/Loading';

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
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">暂无文章</p>
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
