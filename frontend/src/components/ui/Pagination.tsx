'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm',
            page === currentPage
              ? 'bg-emerald-600 text-white'
              : 'hover:bg-gray-100 text-gray-600'
          )}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
