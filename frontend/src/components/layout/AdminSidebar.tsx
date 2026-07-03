'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, FolderOpen, Bot, MessageSquare, Users, Shield, Settings,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/articles', label: '文章管理', icon: FileText },
  { href: '/admin/categories', label: '分类管理', icon: FolderOpen },
  { href: '/admin/crawl', label: 'AI抓取', icon: Bot },
  { href: '/admin/comments', label: '评论管理', icon: MessageSquare },
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/roles', label: '角色管理', icon: Shield },
  { href: '/admin/settings', label: '系统配置', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex-shrink-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white">管理后台</h2>
      </div>
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
