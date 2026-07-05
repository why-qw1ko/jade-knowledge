'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArticleList } from '@/components/article/ArticleList';
import { BannerCarousel } from '@/components/ui/BannerCarousel';
import { AnnouncementMarquee } from '@/components/ui/AnnouncementMarquee';
import { Button } from '@/components/ui/Button';
import { articlesApi, categoriesApi, bannersApi, resolveImageUrl } from '@/lib/api';
import { Gem, ArrowRight, BookOpen, Search, Star, TrendingUp, Eye, FileText, Users, Clock } from 'lucide-react';

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  articleId?: number;
}

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [hotArticles, setHotArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // 加载分类、轮播图、热门文章和最新文章
  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, configRes, hotRes, latestRes]: any = await Promise.all([
          categoriesApi.listTree(),
          bannersApi.getConfig().catch(() => null),
          articlesApi.list({ pageNum: 1, pageSize: 6, sort: 'viewCount' }).catch(() => null),
          articlesApi.list({ pageNum: 1, pageSize: 6 }),
        ]);
        if (catRes.code === 200) setCategories(catRes.data || []);

        if (configRes?.code === 200 && configRes.data?.banner_enabled === 'true') {
          setBannerEnabled(true);
          const bannerRes: any = await bannersApi.list();
          if (bannerRes.code === 200) setBanners(bannerRes.data || []);
        }

        if (hotRes?.code === 200) setHotArticles(hotRes.data?.records || []);
        if (latestRes.code === 200) setArticles(latestRes.data?.records || []);
      } catch {
        // Silently fail
      } finally {
        setHeroLoaded(true);
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero / Banner Carousel */}
        {heroLoaded && (
          bannerEnabled && banners.length > 0 ? (
            <BannerCarousel banners={banners} />
          ) : (
            <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
              <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <Gem className="w-16 h-16 mx-auto mb-6 text-emerald-200" />
                <h1 className="text-4xl md:text-5xl font-bold mb-4">探索玉石之美</h1>
                <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
                  专业的玉石知识平台，汇集玉石鉴别、收藏经验与文化科普，助您成为玉石行家
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/articles">
                    <Button size="lg" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--brand-text)' }} hoverStyle={{ backgroundColor: 'var(--brand-light)' }}>
                      <BookOpen className="w-5 h-5 mr-2" />浏览文章
                    </Button>
                  </Link>
                  <Link href="/search">
                    <Button size="lg" variant="ghost" style={{ color: 'var(--text-inverse)', border: '1px solid var(--text-inverse)' }} hoverStyle={{ backgroundColor: 'var(--brand-hover)' }}>
                      <Search className="w-5 h-5 mr-2" />搜索知识
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          )
        )}

        {/* Announcement Marquee */}
        <AnnouncementMarquee />

        {/* Categories */}
        {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>知识分类</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.slice(0, 5).map((cat: { id: number; name: string; icon?: string; description?: string }) => (
                <Link key={cat.id} href={`/articles?categoryId=${cat.id}`}>
                  <div
                    className="rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--brand-light)' }}>
                      <Star className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
                    </div>
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</h3>
                    {cat.description && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{cat.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Hot Articles */}
        {hotArticles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" style={{ color: 'var(--status-danger)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>热门文章</h2>
              </div>
              <Link href="/articles" className="flex items-center gap-1 text-sm transition-all group" style={{ color: 'var(--brand-primary)' }}>
                查看全部 <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotArticles.slice(0, 6).map((article: { id: number; title: string; summary?: string; viewCount?: number; coverImage?: string }, index: number) => (
                <Link key={article.id} href={`/articles/${article.id}`}>
                  <div
                    className="rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                  >
                    {article.coverImage && (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={resolveImageUrl(article.coverImage)}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {index < 3 && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#eab308',
                              color: '#fff',
                            }}
                          >
                            TOP {index + 1}
                          </span>
                        )}
                        <h3 className="text-sm font-semibold line-clamp-1 flex-1" style={{ color: 'var(--text-primary)' }}>
                          {article.title}
                        </h3>
                      </div>
                      {article.summary && (
                        <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>
                          {article.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Eye className="w-3 h-3" />
                        <span>{article.viewCount || 0} 次浏览</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest Articles */}
        <section className="max-w-7xl mx-auto px-4 pb-16">
          {(loading || articles.length > 0) && (
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>最新文章</h2>
              </div>
              <Link href="/articles" className="flex items-center gap-1 text-sm transition-all group" style={{ color: 'var(--brand-primary)' }}>
                查看全部 <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
          <ArticleList articles={articles} loading={loading} />
        </section>
      </main>
      <Footer />
    </>
  );
}
