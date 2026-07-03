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

export function StatsCard({ title, value, icon, color = 'emerald' }: StatsCardProps) {
  const Icon = iconMap[icon] || FileText;
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color] || colors.emerald}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
