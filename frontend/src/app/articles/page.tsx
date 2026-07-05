'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArticleList } from '@/components/article/ArticleList';
import { Pagination } from '@/components/ui/Pagination';
import { articlesApi, categoriesApi } from '@/lib/api';
import { FolderOpen } from 'lucide-react';

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="flex items-center gap-1.5">{[0,1,2].map(i=><div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce" style={{backgroundColor:'var(--brand-primary)',animationDelay:`${i*0.15}s`}}/>)}</div></div>}>
      <ArticlesContent />
    </Suspense>
  );
}

function ArticlesContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState<{ id: number; name: string; parentId?: number }[]>([]);
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

  // Split into parent/child categories
  const parentCategories = categories.filter(c => !c.parentId || c.parentId === 0);
  const childCategories = categories.filter(c => c.parentId && c.parentId !== 0);

  return (
    <>
      <Header />
      <main className="w-full max-w-7xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>文章列表</h1>
        {/* 双栏布局：Grid固定列宽，侧边栏224px，小屏单列隐藏侧边栏 */}
        <div className="grid grid-cols-1 md:grid-cols-[224px_minmax(0,1fr)] gap-8 w-full">
          {/* Sidebar - Grid第一列，固定224px，小屏隐藏 */}
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <FolderOpen className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>分类筛选</h3>
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => { setPage(1); window.history.pushState({}, '', '/articles'); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  style={!categoryId ? {
                    backgroundColor: 'var(--brand-light)',
                    color: 'var(--brand-text)',
                    fontWeight: 500,
                  } : {
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => { if (categoryId) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { if (categoryId) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >全部文章</button>
                {parentCategories.map((cat) => (
                  <div key={cat.id}>
                    <button
                      onClick={() => { setPage(1); window.history.pushState({}, '', `/articles?categoryId=${cat.id}`); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={String(cat.id) === categoryId ? {
                        backgroundColor: 'var(--brand-light)',
                        color: 'var(--brand-text)',
                      } : {
                        color: 'var(--text-primary)',
                      }}
                      onMouseEnter={(e) => { if (String(cat.id) !== categoryId) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                      onMouseLeave={(e) => { if (String(cat.id) !== categoryId) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >{cat.name}</button>
                    <div className="ml-3">
                      {childCategories.filter(c => c.parentId === cat.id).map((child) => (
                        <button
                          key={child.id}
                          onClick={() => { setPage(1); window.history.pushState({}, '', `/articles?categoryId=${child.id}`); }}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors"
                          style={String(child.id) === categoryId ? {
                            backgroundColor: 'var(--brand-light)',
                            color: 'var(--brand-text)',
                            fontWeight: 500,
                          } : {
                            color: 'var(--text-muted)',
                          }}
                          onMouseEnter={(e) => { if (String(child.id) !== categoryId) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                          onMouseLeave={(e) => { if (String(child.id) !== categoryId) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >{child.name}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
          {/* Main content - Grid第二列，自动填满剩余空间 */}
          <div>
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
