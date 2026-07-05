'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Pagination } from '@/components/ui/Pagination';
import { searchApi, resolveImageUrl } from '@/lib/api';
import { Search, TrendingUp, Eye, Clock, ArrowRight, X, FileText } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  summary?: string;
  coverImage?: string;
  viewCount?: number;
  createTime?: string;
  authorName?: string;
  categoryName?: string;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchLoading() {
  return (
    <>
      <Header />
      <main className="flex-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl h-32" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';

  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState(q);

  const hotKeywords = ['翡翠鉴定', '帝王绿', '和田玉', '冰种', '手镯保养', '雕刻工艺'];

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

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

  const handleSearch = (keyword?: string) => {
    const searchTerm = keyword || searchInput.trim();
    if (searchTerm) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleClear = () => {
    setSearchInput('');
    router.push('/search');
  };

  return (
    <>
      <Header />
      <main className="flex-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {/* Search Section */}
        <section className="py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-3xl mx-auto px-4">
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                搜索玉石知识
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                探索翡翠、和田玉的鉴别、保养与收藏知识
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索翡翠种类、鉴定方法、保养技巧..."
                className="w-full pl-12 pr-20 py-4 rounded-xl text-base focus:outline-none transition-all"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '2px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
              />
              {searchInput && (
                <button
                  onClick={handleClear}
                  className="absolute right-16 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleSearch()}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#fff',
                }}
              >
                搜索
              </button>
            </div>

            {/* Hot Keywords */}
            {!q && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <TrendingUp className="w-3.5 h-3.5" /> 热门搜索
                </span>
                {hotKeywords.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => handleSearch(kw)}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--brand-primary)';
                      e.currentTarget.style.color = 'var(--brand-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Results Section */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {q ? (
            <>
              {/* Result Stats */}
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  找到 <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{total}</span> 条关于「
                  <span style={{ color: 'var(--brand-primary)' }}>{q}</span>」的结果
                </p>
              </div>

              {/* Results Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="rounded-xl p-5 animate-pulse"
                      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                    >
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                        <div className="flex-1 space-y-2">
                          <div className="w-3/4 h-5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                          <div className="w-full h-4 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                          <div className="w-1/2 h-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                    未找到相关结果
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    试试其他关键词，或浏览热门搜索
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((article) => (
                    <Link key={article.id} href={`/articles/${article.id}`}>
                      <div
                        className="rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-primary)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                          e.currentTarget.style.borderColor = 'var(--brand-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                        }}
                      >
                        <div className="flex gap-4 p-5">
                          {/* Image */}
                          {article.coverImage && (
                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={resolveImageUrl(article.coverImage)}
                                alt={article.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = resolveImageUrl('/upload/default.png'); }}
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-sm font-semibold mb-1.5 line-clamp-2"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {article.title}
                            </h3>
                            {article.summary && (
                              <p
                                className="text-xs line-clamp-2 mb-2"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {article.summary}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                              {article.categoryName && (
                                <span
                                  className="px-2 py-0.5 rounded"
                                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                                >
                                  {article.categoryName}
                                </span>
                              )}
                              {article.viewCount !== undefined && (
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> {article.viewCount}
                                </span>
                              )}
                              {article.createTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {article.createTime?.slice(0, 10)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {total > 12 && (
                <div className="mt-8 flex justify-center">
                  <Pagination currentPage={page} totalPages={Math.ceil(total / 12)} onPageChange={setPage} />
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--brand-light)' }}
              >
                <Search className="w-10 h-10" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                输入关键词开始搜索
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                支持搜索翡翠种类、鉴定方法、保养技巧等
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
