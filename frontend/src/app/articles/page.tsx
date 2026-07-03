'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArticleList } from '@/components/article/ArticleList';
import { Pagination } from '@/components/ui/Pagination';
import { articlesApi, categoriesApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ArticlesPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    categoriesApi.listTree().then((res: any) => {
      if (res.code === 200) setCategories(res.data || []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    articlesApi.list({
      pageNum: page,
      pageSize: 12,
      categoryId: categoryId || undefined,
    }).then((res: any) => {
      if (res.code === 200) {
        setArticles(res.data?.records || []);
        setTotal(res.data?.total || 0);
      }
    }).finally(() => setLoading(false));
  }, [page, categoryId]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">文章列表</h1>
        <div className="flex gap-8">
          {/* Sidebar - desktop */}
          <aside className="hidden md:block w-48 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">分类筛选</h3>
            <div className="space-y-1">
              <button
                onClick={() => { setPage(1); window.history.pushState({}, '', '/articles'); }}
                className={cn('w-full text-left px-3 py-2 rounded-lg text-sm', !categoryId ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100')}
              >全部</button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setPage(1); window.history.pushState({}, '', `/articles?categoryId=${cat.id}`); }}
                  className={cn('w-full text-left px-3 py-2 rounded-lg text-sm', String(cat.id) === categoryId ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100')}
                >{cat.name}</button>
              ))}
            </div>
          </aside>
          {/* Main content */}
          <div className="flex-1">
            <ArticleList articles={articles} loading={loading} />
            {total > 12 && (
              <div className="mt-8 flex justify-center">
                <Pagination currentPage={page} totalPages={Math.ceil(total / 12)} onPageChange={setPage} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
