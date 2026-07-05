'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CommentForm } from '@/components/comment/CommentForm';
import { CommentList } from '@/components/comment/CommentList';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Loading';
import { articlesApi, commentsApi, favoritesApi, resolveImageUrl } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { Eye, Heart, User, ArrowLeft, Clock, Tag, BookOpen, List, FileText, Code } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import '@/styles/article-content.css';

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
  contentFormat?: string;
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

interface TocItem {
  id: string;
  text: string;
  level: number;
}

// 将标题文本转换为slug格式（与rehype-slug一致）
function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w一-龥-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function ArticleDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { isAuthenticated } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  const loadArticle = async () => {
    try {
      const res: any = await articlesApi.getById(id);
      if (res.code === 200) {
        setArticle(res.data);
        setIsFavorited(res.data.isFavorited || false);
      }
    } catch {
      // article stays null
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (p = commentPage) => {
    setCommentLoading(true);
    try {
      const res: any = await commentsApi.listByArticle(id, p, 10);
      if (res.code === 200) {
        setComments(res.data?.records || []);
        setCommentTotal(res.data?.total || 0);
      }
    } catch {
      // 静默失败
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    if (id) { loadArticle(); loadComments(1); }
  }, [id]);

  useEffect(() => {
    if (id) loadComments(commentPage);
  }, [commentPage]);

  // Extract headings for TOC
  useEffect(() => {
    if (!article?.content) return;

    const headings: TocItem[] = [];
    const content = article.content;
    const isHtml = article.contentFormat === 'html';

    if (isHtml) {
      // Parse HTML headings
      const regex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        const level = parseInt(match[1]);
        const text = match[2].replace(/<[^>]+>/g, '').trim();
        const id = textToSlug(text);
        if (text) headings.push({ id, text, level });
      }
    } else {
      // Parse Markdown headings - 使用与rehype-slug相同的slug生成规则
      const regex = /^(#{1,6})\s+(.+)$/gm;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = textToSlug(text);
        headings.push({ id, text, level });
      }
    }

    setToc(headings);
  }, [article]);

  // Track active heading on scroll
  useEffect(() => {
    if (toc.length === 0) return;

    let observer: IntersectionObserver | null = null;

    // 延迟设置observer，确保DOM已渲染完成
    const timeoutId = setTimeout(() => {
      if (!contentRef.current) return;

      // 获取所有标题元素（带id的）
      const headingElements = contentRef.current.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
      if (headingElements.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          // 找到进入视口的标题
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveTocId(entry.target.id);
              break;
            }
          }
        },
        {
          rootMargin: '-88px 0px -70% 0px',
          threshold: 0
        }
      );

      headingElements.forEach((h) => observer!.observe(h));
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, [toc, article?.content]);

  const handleFavorite = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    const res: any = await favoritesApi.toggle(id);
    if (res.code === 200) setIsFavorited(res.data);
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerHeight = 72; // 导航栏高度
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerHeight - 16; // 额外16px间距
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Add ids to HTML headings for TOC navigation
  const processHtmlContent = (html: string): string => {
    return html.replace(/<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/gi, (match, level, attrs, content) => {
      const text = content.replace(/<[^>]+>/g, '').trim();
      const id = textToSlug(text);
      // 检查是否已有id属性
      if (/id\s*=/i.test(attrs)) {
        return match; // 已有id，不覆盖
      }
      return `<h${level} id="${id}"${attrs}>${content}</h${level}>`;
    });
  };

  if (loading) return <><Header /><main className="min-h-screen flex items-center justify-center"><Spinner /></main><Footer /></>;
  if (!article) return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <BookOpen className="w-16 h-16 text-gray-300" />
        <p className="text-xl text-gray-500">文章不存在</p>
        <Link href="/articles" className="text-emerald-600 hover:underline">← 返回文章列表</Link>
      </main>
      <Footer />
    </>
  );

  const tagList = article.tags ? article.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const isHtml = article.contentFormat === 'html';

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[80vh]">
        {/* Back button */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium mb-6 transition-all hover:shadow-sm"
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <ArrowLeft className="w-4 h-4" />返回文章列表
        </Link>

        <div className="flex gap-8">
          {/* Main content */}
          <article className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                {article.categoryName && (
                  <Badge variant="green">{article.categoryName}</Badge>
                )}
                <Badge variant={isHtml ? 'blue' : 'purple'}>
                  {isHtml ? (
                    <span className="flex items-center gap-1"><Code className="w-3 h-3" />HTML</span>
                  ) : (
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" />Markdown</span>
                  )}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>{article.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{article.authorName || '匿名'}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{formatDate(article.createTime)}</span>
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{article.viewCount || 0} 次阅读</span>
                <button onClick={handleFavorite} className="flex items-center gap-1.5 ml-auto group transition-all hover:scale-105">
                  <Heart className={`w-5 h-5 transition-all ${isFavorited ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400 group-hover:text-red-400 group-hover:scale-110'}`} />
                  <span className="text-sm">{isFavorited ? '已收藏' : '收藏'}</span>
                </button>
              </div>
            </div>

            {article.coverImage && (
              <img src={resolveImageUrl(article.coverImage)} alt="" className="w-full h-64 md:h-96 object-cover rounded-xl mb-8" />
            )}

            {/* Content */}
            <div
              ref={contentRef}
              className="article-content mb-12"
            >
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: processHtmlContent(article.content || '') }} />
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}
                >
                  {article.content || ''}
                </ReactMarkdown>
              )}
            </div>

            {/* Tags */}
            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                <Tag className="w-4 h-4 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                {tagList.map((tag, i) => (
                  <span key={i} className="transition-transform hover:scale-105">
                    <Badge variant="blue">{tag}</Badge>
                  </span>
                ))}
              </div>
            )}

            {/* Comments */}
            <section className="border-t pt-8" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>评论 ({commentTotal})</h2>
              {isAuthenticated ? (
                <div className="mb-8">
                  <CommentForm articleId={id} onSuccess={loadComments} />
                </div>
              ) : (
                <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
                  <Link href="/login" className="hover:underline" style={{ color: 'var(--brand-primary)' }}>登录</Link>后发表评论
                </p>
              )}
              {commentLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : (
                <CommentList comments={comments} />
              )}
              {commentTotal > 10 && (
                <div className="mt-6">
                  <Pagination currentPage={commentPage} totalPages={Math.ceil(commentTotal / 10)} onPageChange={setCommentPage} />
                </div>
              )}
            </section>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Author card */}
              <div className="rounded-xl p-5 transition-all duration-300 hover:shadow-md" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>作者</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-light)' }}>
                    <User className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{article.authorName || '匿名'}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(article.createTime)}</p>
                  </div>
                </div>
              </div>

              {/* Stats card */}
              <div className="rounded-xl p-5 transition-all duration-300 hover:shadow-md" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>文章数据</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}><Eye className="w-3.5 h-3.5" />阅读</span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{article.viewCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}><Heart className="w-3.5 h-3.5" />收藏</span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{article.favoriteCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}><BookOpen className="w-3.5 h-3.5" />评论</span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{commentTotal}</span>
                  </div>
                </div>
              </div>

              {/* TOC */}
              {toc.length > 0 && (
                <div className="rounded-xl p-5 transition-all duration-300 hover:shadow-md" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <List className="w-4 h-4" />
                    目录
                  </h3>
                  <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
                    {toc.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToHeading(item.id)}
                        className="block w-full text-left text-sm py-1.5 px-2 rounded-lg transition-colors truncate"
                        style={{
                          paddingLeft: `${(item.level - 1) * 12 + 8}px`,
                          color: activeTocId === item.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                          backgroundColor: activeTocId === item.id ? 'var(--brand-light)' : 'transparent',
                          fontWeight: activeTocId === item.id ? 500 : 400,
                        }}
                        title={item.text}
                      >
                        {item.text}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
