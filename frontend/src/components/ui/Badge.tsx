import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'purple';
  className?: string;
}

const variantStyles: Record<string, React.CSSProperties> = {
  green: { backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)' },
  yellow: { backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning)' },
  red: { backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger)' },
  gray: { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' },
  blue: { backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)' },
  purple: { backgroundColor: '#f3e8ff', color: '#9333ea' },
};

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', className)}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: number }) {
  const map: Record<number, { label: string; variant: BadgeProps['variant'] }> = {
    0: { label: '草稿', variant: 'gray' },
    1: { label: '待审核', variant: 'yellow' },
    2: { label: '已发布', variant: 'green' },
    3: { label: '已下线', variant: 'red' },
  };
  const { label, variant } = map[status] || { label: '未知', variant: 'gray' };
  return <Badge variant={variant}>{label}</Badge>;
}
