'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import {
  LayoutDashboard, FileText, FolderOpen, Sparkles, MessageSquare, Users, Shield, Key, Settings, Images,
  Gem, LogOut, Sun, Moon, Monitor, PanelLeftClose, PanelLeftOpen, ExternalLink, Megaphone,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/articles', label: '文章管理', icon: FileText },
  { href: '/admin/categories', label: '分类管理', icon: FolderOpen },
  { href: '/admin/banners', label: '轮播图管理', icon: Images },
  { href: '/admin/announcements', label: '公告管理', icon: Megaphone },
  { href: '/admin/crawl', label: 'AI增效', icon: Sparkles },
  { href: '/admin/comments', label: '评论管理', icon: MessageSquare },
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/roles', label: '角色管理', icon: Shield },
  { href: '/admin/permissions', label: '权限管理', icon: Key },
  { href: '/admin/settings', label: '系统配置', icon: Settings },
];

const themeIcons = { system: Monitor, light: Sun, dark: Moon };
const themeLabels = { system: '跟随系统', light: '浅色模式', dark: '深色模式' };

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useAppStore();
  const ThemeIcon = themeIcons[theme];

  return (
    <aside
      className={cn(
        'flex flex-col h-screen flex-shrink-0 border-r transition-all duration-200',
        sidebarOpen ? 'w-60' : 'w-16',
      )}
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Logo / expand toggle */}
      <div
        className="flex items-center h-16 flex-shrink-0 border-b"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-3 flex-1 min-w-0 px-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--brand-light)' }}>
                <Gem className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <span className="text-base font-bold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                管理后台
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 mr-2 rounded-md transition-colors flex-shrink-0"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              title="收起侧栏"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center w-full">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              title="展开侧栏"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                sidebarOpen ? '' : 'justify-center',
              )}
              style={{
                backgroundColor: isActive ? 'var(--brand-light)' : 'transparent',
                color: isActive ? 'var(--brand-text)' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" style={{ color: isActive ? 'var(--brand-primary)' : undefined }} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t px-2 py-3 space-y-1 flex-shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
        {/* User info */}
        {sidebarOpen && user && (
          <>
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}>
                {(user.nickname || user.username || '').slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.nickname || user.username}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>管理员</p>
              </div>
            </div>
            <div className="border-t mx-3" style={{ borderColor: 'var(--border-secondary)' }} />
          </>
        )}

        {/* Back to frontend */}
        <Link
          href="/"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            sidebarOpen ? '' : 'justify-center',
          )}
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          title="返回前台"
        >
          <ExternalLink className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>返回前台</span>}
        </Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-colors',
            sidebarOpen ? '' : 'justify-center',
          )}
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          title={themeLabels[theme]}
        >
          <ThemeIcon className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>{themeLabels[theme]}</span>}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-colors',
            sidebarOpen ? '' : 'justify-center',
          )}
          style={{ color: 'var(--status-danger)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--status-danger-bg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          title="退出登录"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>退出登录</span>}
        </button>
      </div>
    </aside>
  );
}
