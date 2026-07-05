'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';

interface Column<T> {
  key: string;
  title: string;
  render?: (value: unknown, record: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (keyword: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, row) => (
        <tr key={row} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
          {Array.from({ length: columns }).map((_, col) => (
            <td key={col} className="px-4 py-3">
              <div
                className="h-4 rounded animate-pulse"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  width: col === 0 ? '60%' : col === columns - 1 ? '80px' : '40%',
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  columns, data, loading, total = 0, page = 1, pageSize = 10, onPageChange, onSearch, searchPlaceholder, actions,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize);
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    onSearch?.(searchInput.trim());
  };

  const handleClear = () => {
    setSearchInput('');
    onSearch?.('');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {(onSearch || actions) && (
        <div className="flex items-center justify-between gap-4">
          {onSearch && (
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={searchPlaceholder || '搜索...'}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 pr-8 py-2 rounded-md text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
              />
              {searchInput && (
                <button
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-sm transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  title="清除搜索"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-medium uppercase"
                    style={{ color: 'var(--text-muted)', width: col.width }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            {loading ? (
              <TableSkeleton columns={columns.length} />
            ) : (
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-12 text-center text-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  data.map((record, idx) => (
                    <tr
                      key={idx}
                      style={{ borderBottom: '1px solid var(--border-secondary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className="px-4 py-3 text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {col.render ? col.render(record[col.key], record) : String(record[col.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            共 {total} 条记录
          </span>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
