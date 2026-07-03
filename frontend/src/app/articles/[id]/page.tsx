'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CommentForm } from '@/components/comment/CommentForm';
import { CommentList } from '@/components/comment/CommentList';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { articlesApi, commentsApi, favoritesApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { Eye, Heart, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Article {
  id: number;
  title: string;
  content?: string;
  summary?: string;
  coverImage?: string;
  categoryName?: string;
  authorName?: string;
  tags?: string;
  status: number;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  isFavorited?: boolean;
  createTime: string;
}

interface Comment {
  id: number;
  content: string;
  userName?: string;
  userAvatar?: string;
  createTime?: string;
  children?: Comment[];
}

export default function ArticleDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { isAuthenticated } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  const loadArticle = async () => {
    try {
      const res: any = await articlesApi.getById(id);
      if (res.code === 200) {
        setArticle(res.data);
        setIsFavorited(res.data.isFavorited || false);
      }
    } catch {} finally { setLoading(false); }
  };

  const loadComments = async () => {
    const res: any = await commentsApi.listByArticle(id, 1, 50);
    if (res.code === 200) setComments(res.data?.records || []);
  };

  useEffect(() => {
    if (id) { loadArticle(); loadComments(); }
  }, [id]);

  const handleFavorite = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    const res: any = await favoritesApi.toggle(id);
    if (res.code === 200) setIsFavorited(res.data);
  };

  if (loading) return <><Header /><Spinner /><Footer /></>;
  if (!article) return <><Header /><div className="text-center py-20">文章不存在</div><Footer /></>;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/articles" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4" />返回列表
        </Link>

        <article>
          <div className="mb-8">
            {article.categoryName && (
              <Badge variant="green" className="mb-3">{article.categoryName}</Badge>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><User className="w-4 h-4" />{article.authorName || '匿名'}</span>
              <span>{formatDate(article.createTime)}</span>
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{article.viewCount || 0}</span>
              <button onClick={handleFavorite} className="flex items-center gap-1 ml-auto">
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                <span className="text-sm">{isFavorited ? '已收藏' : '收藏'}</span>
              </button>
            </div>
          </div>

          {article.coverImage && (
            <img src={article.coverImage} alt="" className="w-full h-64 md:h-96 object-cover rounded-xl mb-8" />
          )}

          <div className="prose prose-emerald max-w-none mb-12" dangerouslySetInnerHTML={{ __html: article.content || '' }} />

          {article.tags && (
            <div className="flex gap-2 mb-8">
              {article.tags.split(',').map((tag: string, i: number) => (
                <Badge key={i} variant="blue">{tag.trim()}</Badge>
              ))}
            </div>
          )}
        </article>

        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold mb-6">评论 ({comments.length})</h2>
          {isAuthenticated ? (
            <div className="mb-8">
              <CommentForm articleId={id} onSuccess={loadComments} />
            </div>
          ) : (
            <p className="text-gray-500 mb-8"><Link href="/login" className="text-emerald-600">登录</Link>后发表评论</p>
          )}
          <CommentList comments={comments} />
        </section>
      </main>
      <Footer />
    </>
  );
}
