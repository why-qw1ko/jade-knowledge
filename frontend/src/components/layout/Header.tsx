'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import { searchApi } from '@/lib/api';
import { Gem, Search, Menu, X, User, LogOut, LayoutDashboard, Sun, Moon, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchSuggestion {
  id: number;
  title: string;
  authorName?: string;
  createTime?: string;
}

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { resolvedTheme, setTheme } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res: any = await searchApi.suggest(q.trim());
        if (res.code === 200) {
          setSuggestions(res.data?.records || []);
          setShowDropdown(true);
        }
      } catch {
        // silent
      }
    }, 300);
  }, []);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    fetchSuggestions(value);
  };

  const handleSelectArticle = (id: number) => {
    setShowDropdown(false);
    setSearchQuery('');
    router.push(`/articles/${id}`);
  };

  // Truncate text with ellipsis
  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + '...' : text;

  // Format date to short form
  const shortDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return dateStr.slice(0, 10);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/articles', label: '文章' },
    { href: '/announcements', label: '公告' },
    { href: '/search', label: '搜索' },
  ];

  return (
    <header
      className="sticky top-0 z-50"
      style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-6">
        {/* ===== Left: Logo + Search ===== */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Gem className="w-7 h-7" style={{ color: 'var(--brand-primary)' }} />
            <span className="text-lg font-bold hidden sm:inline" style={{ color: 'var(--text-primary)' }}>玉石知识平台</span>
          </Link>

          {/* Search bar with dropdown */}
          <div ref={searchRef} className="relative w-56 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
              placeholder="搜索文章..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none transition-all"
              style={{ border: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            />
            {/* Suggestions dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', zIndex: 9999 }}
              >
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    onClick={() => handleSelectArticle(item.id)}
                  >
                    <span
                      className="text-sm flex-1 min-w-0 truncate"
                      style={{ color: 'var(--text-primary)' }}
                      title={item.title}
                    >
                      {truncate(item.title, 25)}
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {item.authorName || '匿名'}
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {shortDate(item.createTime)}
                    </span>
                  </div>
                ))}
                <div
                  className="px-4 py-2 text-center text-xs cursor-pointer transition-colors"
                  style={{ color: 'var(--brand-primary)', borderTop: '1px solid var(--border-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  onClick={handleSearchSubmit}
                >
                  查看全部搜索结果 →
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== Right: Nav + User + Theme ===== */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive(link.href) ? 'var(--brand-light)' : 'transparent',
                color: isActive(link.href) ? 'var(--brand-primary)' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => { if (!isActive(link.href)) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { if (!isActive(link.href)) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {link.label}
            </Link>
          ))}

          {/* Login (未登录时显示在主题切换前面) */}
          {!isAuthenticated && (
            <Link href="/login" className="px-3 py-2 text-sm font-medium rounded-lg transition-colors ml-1"
              style={{
                backgroundColor: isActive('/login') ? 'var(--brand-light)' : 'transparent',
                color: isActive('/login') ? 'var(--brand-primary)' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => { if (!isActive('/login')) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { if (!isActive('/login')) e.currentTarget.style.backgroundColor = 'transparent'; }}>
              登录
            </Link>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            title={resolvedTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          >
            {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User icon (登录后显示在主题切换右边) */}
          {isAuthenticated && (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-1 rounded-lg transition-colors"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                title={user?.nickname || user?.username}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                )}
              </button>
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', zIndex: 9999 }}
                >
                  {/* User info header */}
                  <div className="p-4 text-center" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--brand-light)' }}>
                        <User className="w-8 h-8" style={{ color: 'var(--brand-primary)' }} />
                      </div>
                    )}
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>昵称</p>
                    <p className="font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{user?.nickname || user?.username}</p>
                  </div>
                  {/* Menu items */}
                  <div className="py-1">
                    <Link href="/profile" className="flex items-center justify-between px-4 py-2.5 text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      onClick={() => setUserMenuOpen(false)}>
                      <span className="flex items-center gap-2"><User className="w-4 h-4" />个人中心</span>
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center justify-between px-4 py-2.5 text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        onClick={() => setUserMenuOpen(false)}>
                        <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" />管理后台</span>
                        <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      </Link>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <button onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm w-full text-left transition-colors" style={{ color: 'var(--status-danger)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--status-danger-bg)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <LogOut className="w-4 h-4" />退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={toggleTheme} className="p-2" style={{ color: 'var(--text-secondary)' }}>
            {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 py-3 space-y-2" style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-primary)' }}>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input value={searchQuery} onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleSearchSubmit(); setMobileOpen(false); } }}
              placeholder="搜索文章..." className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none"
              style={{ border: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            {/* Mobile suggestions */}
            {showDropdown && suggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', zIndex: 9999 }}
              >
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => { handleSelectArticle(item.id); setMobileOpen(false); }}
                  >
                    <span className="text-sm flex-1 min-w-0 truncate" title={item.title}>
                      {truncate(item.title, 20)}
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {shortDate(item.createTime)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="block py-2 px-3 rounded-lg text-sm font-medium"
              style={{ backgroundColor: isActive(item.href) ? 'var(--brand-light)' : 'transparent', color: isActive(item.href) ? 'var(--brand-primary)' : 'var(--text-secondary)' }}
              onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="block py-2 px-3 rounded-lg" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileOpen(false)}>个人中心</Link>
              {isAdmin && <Link href="/admin" className="block py-2 px-3 rounded-lg" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileOpen(false)}>管理后台</Link>}
              <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-2 w-full text-left px-3 rounded-lg" style={{ color: 'var(--status-danger)' }}>退出登录</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 px-3 rounded-lg text-sm font-medium"
                style={{ backgroundColor: isActive('/login') ? 'var(--brand-light)' : 'transparent', color: isActive('/login') ? 'var(--brand-primary)' : 'var(--text-secondary)' }}
                onClick={() => setMobileOpen(false)}>登录</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
