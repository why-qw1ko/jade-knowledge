'use client';

import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastItem {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: number) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colors = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] animate-in slide-in-from-right',
              colors[toast.type]
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm flex-1">{toast.message}</p>
            <button onClick={() => onRemove(toast.id)} className="p-0.5 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
