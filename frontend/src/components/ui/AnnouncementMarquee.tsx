'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { announcementsApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Megaphone, ChevronRight, X, Bell } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: number;
  isTop: number;
  publishTime?: string;
}

const typeLabels: Record<number, { label: string; color: string }> = {
  0: { label: '公告', color: 'var(--status-info)' },
  1: { label: '重要', color: 'var(--status-warning)' },
  2: { label: '紧急', color: 'var(--status-danger)' },
};

export function AnnouncementMarquee() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    announcementsApi.getLatest(5).then((res: any) => {
      if (res.code === 200) {
        setAnnouncements(res.data || []);
      }
    });
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [announcements]);

  const handleClickTitle = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  const handleViewAll = () => {
    router.push('/announcements');
  };

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex];
  const typeInfo = typeLabels[current.type] || typeLabels[0];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="rounded-lg mt-4 mb-2"
          style={{
            backgroundColor: 'var(--brand-light)',
          }}
        >
          <div className="px-4 py-3.5 flex items-center gap-3">
            {/* Icon */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Megaphone className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
              <span
                className="text-xs font-medium px-2 py-1 rounded leading-none"
                style={{
                  backgroundColor: typeInfo.color,
                  color: '#fff',
                }}
              >
                {typeInfo.label}
              </span>
            </div>

            {/* Scrolling content */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div
                className="truncate cursor-pointer text-sm transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => handleClickTitle(current)}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              >
                {current.title}
              </div>
            </div>

            {/* Time */}
            <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: 'var(--text-muted)' }}>
              {current.publishTime ? formatDateTime(current.publishTime).split(' ')[0] : ''}
            </span>

            {/* View all */}
            <button
              onClick={handleViewAll}
              className="flex items-center gap-1 text-xs flex-shrink-0 transition-colors"
              style={{ color: 'var(--brand-primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
            >
              查看更多 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Announcement Detail Modal */}
      {showModal && selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl shadow-xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border-primary)' }}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  公告详情
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                {selectedAnnouncement.title}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: typeLabels[selectedAnnouncement.type]?.color || 'var(--status-info)',
                    color: '#fff',
                  }}
                >
                  {typeLabels[selectedAnnouncement.type]?.label || '公告'}
                </span>
                {selectedAnnouncement.publishTime && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDateTime(selectedAnnouncement.publishTime)}
                  </span>
                )}
              </div>
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--text-secondary)' }}
              >
                {selectedAnnouncement.content}
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-5 py-3 flex justify-end"
              style={{ borderTop: '1px solid var(--border-primary)' }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
    </>
  );
}
