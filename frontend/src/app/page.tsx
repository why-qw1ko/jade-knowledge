'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArticleList } from '@/components/article/ArticleList';
import { Button } from '@/components/ui/Button';
import { articlesApi, categoriesApi } from '@/lib/api';
import { Gem, ArrowRight, BookOpen, Search, Star } from 'lucide-react';

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [artRes, catRes]: any = await Promise.all([
          articlesApi.list({ pageNum: 1, pageSize: 6 }),
          categoriesApi.listTree(),
        ]);
        if (artRes.code === 200) setArticles(artRes.data?.records || []);
        if (catRes.code === 200) setCategories(catRes.data || []);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
          <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <Gem className="w-16 h-16 mx-auto mb-6 text-emerald-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">探索翡翠之美</h1>
            <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
              专业的玉石知识平台，汇集翡翠鉴别、收藏经验与文化科普，助您成为玉石行家
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/articles">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
                  <BookOpen className="w-5 h-5 mr-2" />浏览文章
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="ghost" className="text-white border-white hover:bg-emerald-700">
                  <Search className="w-5 h-5 mr-2" />搜索知识
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">知识分类</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 4).map((cat: { id: number; name: string; icon?: string; description?: string }) => (
                <Link key={cat.id} href={`/articles?categoryId=${cat.id}`}>
                  <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow border border-gray-100">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Star className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                    {cat.description && <p className="text-xs text-gray-500 mt-1">{cat.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest Articles */}
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">最新文章</h2>
            <Link href="/articles" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ArticleList articles={articles} loading={loading} />
        </section>
      </main>
      <Footer />
    </>
  );
}
