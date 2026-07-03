'use client';

import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Loading';

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

export function DataTable<T extends Record<string, unknown>>({
  columns, data, loading, total = 0, page = 1, pageSize = 10, onPageChange, onSearch, searchPlaceholder, actions,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {(onSearch || actions) && (
        <div className="flex items-center justify-between gap-4">
          {onSearch && (
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder || '搜索...'}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ width: col.width }}>
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">暂无数据</td>
                  </tr>
                ) : (
                  data.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-sm">
                          {col.render ? col.render(record[col.key], record) : String(record[col.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
