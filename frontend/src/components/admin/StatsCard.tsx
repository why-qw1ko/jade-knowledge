'use client';

import { LayoutDashboard, FileText, FolderOpen, Bot, MessageSquare, Users, Shield, Settings } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
}

const iconMap: Record<string, React.ElementType> = {
  articles: FileText,
  users: Users,
  comments: MessageSquare,
  pending: Bot,
  dashboard: LayoutDashboard,
  categories: FolderOpen,
  roles: Shield,
  settings: Settings,
};

const colorMap: Record<string, { bg: string; fg: string }> = {
  emerald: { bg: 'var(--status-success-bg)', fg: 'var(--status-success)' },
  blue: { bg: 'var(--status-info-bg)', fg: 'var(--status-info)' },
  yellow: { bg: 'var(--status-warning-bg)', fg: 'var(--status-warning)' },
  red: { bg: 'var(--status-danger-bg)', fg: 'var(--status-danger)' },
};

export function StatsCard({ title, value, icon, color = 'emerald' }: StatsCardProps) {
  const Icon = iconMap[icon] || FileText;
  const c = colorMap[color] || colorMap.emerald;

  return (
    <div
      className="rounded-lg p-5"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{title}</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
        </div>
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: c.bg, color: c.fg }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
