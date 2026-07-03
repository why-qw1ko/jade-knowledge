'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchBar } from '@/components/search/SearchBar';
import { ArticleList } from '@/components/article/ArticleList';
import { Pagination } from '@/components/ui/Pagination';
import { searchApi } from '@/lib/api';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    searchApi.search(q, page, 12).then((res: any) => {
      if (res.code === 200) {
        setResults(res.data?.records || []);
        setTotal(res.data?.total || 0);
      }
    }).finally(() => setLoading(false));
  }, [q, page]);

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">搜索</h1>
        <SearchBar defaultValue={q} className="mb-8" />
        {q ? (
          <>
            <p className="text-sm text-gray-500 mb-4">找到 {total} 条关于「{q}」的结果</p>
            <ArticleList articles={results} loading={loading} />
            {total > 12 && (
              <div className="mt-8 flex justify-center">
                <Pagination currentPage={page} totalPages={Math.ceil(total / 12)} onPageChange={setPage} />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">输入关键词搜索玉石知识</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
