import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'yellow' | 'red' | 'gray' | 'blue';
  className?: string;
}

const variants = {
  green: 'bg-emerald-100 text-emerald-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
  blue: 'bg-blue-100 text-blue-700',
};

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
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
