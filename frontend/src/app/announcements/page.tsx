'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Pagination } from '@/components/ui/Pagination';
import { announcementsApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Megaphone, Bell, ChevronRight } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: number;
  isTop: number;
  publishTime?: string;
}

const typeLabels: Record<number, { label: string; variant: string }> = {
  0: { label: '普通公告', variant: 'blue' },
  1: { label: '重要公告', variant: 'yellow' },
  2: { label: '紧急公告', variant: 'red' },
};

const typeColors: Record<number, string> = {
  0: 'var(--status-info)',
  1: 'var(--status-warning)',
  2: 'var(--status-danger)',
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    announcementsApi.list({ pageNum: page, pageSize: 10 }).then((res: any) => {
      if (res.code === 200) {
        setAnnouncements(res.data?.records || []);
        setTotal(res.data?.total || 0);
      }
    }).finally(() => setLoading(false));
  }, [page]);

  const handleClickAnnouncement = async (id: number) => {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const res: any = await announcementsApi.getById(id);
      if (res.code === 200) {
        setSelectedAnnouncement(res.data);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedId(null);
    setSelectedAnnouncement(null);
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="py-12"
          style={{ backgroundColor: 'var(--brand-light)' }}
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Megaphone className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--brand-primary)' }} />
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              平台公告
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              了解平台最新动态、活动信息和重要通知
            </p>
          </div>
        </section>

        {/* Announcement List */}
        <section className="max-w-4xl mx-auto px-4 py-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 animate-pulse"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                    <div className="w-24 h-4 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                  </div>
                  <div className="w-3/4 h-5 rounded mb-2" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                  <div className="w-full h-4 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-16">
              <Megaphone className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>
                暂无公告
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: selectedId === item.id ? '2px solid var(--brand-primary)' : '1px solid var(--border-primary)',
                    boxShadow: selectedId === item.id ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'var(--shadow-sm)',
                  }}
                  onClick={() => handleClickAnnouncement(item.id)}
                  onMouseEnter={(e) => {
                    if (selectedId !== item.id) {
                      e.currentTarget.style.borderColor = 'var(--brand-primary)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedId !== item.id) {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: typeColors[item.type] || 'var(--status-info)',
                        color: '#fff',
                      }}
                    >
                      {typeLabels[item.type]?.label || '公告'}
                    </span>
                    {item.isTop === 1 && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{ backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}
                      >
                        置顶
                      </span>
                    )}
                    <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                      {item.publishTime ? formatDateTime(item.publishTime) : ''}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {item.content}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs" style={{ color: 'var(--brand-primary)' }}>
                    查看详情 <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 10 && (
            <div className="mt-8 flex justify-center">
              <Pagination currentPage={page} totalPages={Math.ceil(total / 10)} onPageChange={setPage} />
            </div>
          )}
        </section>
      </main>

      {/* Detail Modal */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleCloseDetail}
        >
          <div
            className="w-full max-w-2xl rounded-xl shadow-xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--border-primary)' }}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  公告详情
                </span>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {detailLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="w-3/4 h-6 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                  <div className="w-1/4 h-4 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                  <div className="w-full h-4 rounded mt-4" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                  <div className="w-full h-4 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                  <div className="w-2/3 h-4 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    {selectedAnnouncement.title}
                  </h2>
                  <div className="flex items-center gap-2 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: typeColors[selectedAnnouncement.type] || 'var(--status-info)',
                        color: '#fff',
                      }}
                    >
                      {typeLabels[selectedAnnouncement.type]?.label || '公告'}
                    </span>
                    {selectedAnnouncement.publishTime && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        发布于 {formatDateTime(selectedAnnouncement.publishTime)}
                      </span>
                    )}
                  </div>
                  <div
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {selectedAnnouncement.content}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 flex justify-end"
              style={{ borderTop: '1px solid var(--border-primary)' }}
            >
              <button
                onClick={handleCloseDetail}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#fff',
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
