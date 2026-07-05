'use client';

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

const colorStyles: Record<string, React.CSSProperties> = {
  success: { backgroundColor: 'var(--status-success-bg)', borderColor: 'var(--status-success)', color: 'var(--status-success)' },
  error: { backgroundColor: 'var(--status-danger-bg)', borderColor: 'var(--status-danger)', color: 'var(--status-danger)' },
  info: { backgroundColor: 'var(--status-info-bg)', borderColor: 'var(--status-info)', color: 'var(--status-info)' },
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] animate-in slide-in-from-right"
            style={{
              ...colorStyles[toast.type],
              backgroundColor: colorStyles[toast.type].backgroundColor,
              borderColor: colorStyles[toast.type].borderColor,
            }}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{toast.message}</p>
            <button
              onClick={() => onRemove(toast.id)}
              className="p-0.5 hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
