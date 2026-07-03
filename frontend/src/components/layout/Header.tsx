'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Gem, Search, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Gem className="w-7 h-7 text-emerald-600" />
          <span className="text-xl font-bold text-gray-900">玉石知识平台</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-emerald-600 transition-colors">首页</Link>
          <Link href="/articles" className="text-gray-600 hover:text-emerald-600 transition-colors">文章</Link>
          <Link href="/search" className="text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
            <Search className="w-4 h-4" />搜索
          </Link>
        </nav>

        {/* Right */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">{user?.nickname || user?.username}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                    <User className="w-4 h-4" />个人中心
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" />管理后台
                    </Link>
                  )}
                  <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600">
                    <LogOut className="w-4 h-4" />退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-emerald-600">登录</Link>
              <Link href="/register" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">注册</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2">
          <Link href="/" className="block py-2 text-gray-600" onClick={() => setMobileOpen(false)}>首页</Link>
          <Link href="/articles" className="block py-2 text-gray-600" onClick={() => setMobileOpen(false)}>文章</Link>
          <Link href="/search" className="block py-2 text-gray-600" onClick={() => setMobileOpen(false)}>搜索</Link>
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="block py-2 text-gray-600" onClick={() => setMobileOpen(false)}>个人中心</Link>
              {isAdmin && <Link href="/admin" className="block py-2 text-gray-600" onClick={() => setMobileOpen(false)}>管理后台</Link>}
              <button onClick={logout} className="block py-2 text-red-600 w-full text-left">退出登录</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-emerald-600" onClick={() => setMobileOpen(false)}>登录</Link>
              <Link href="/register" className="block py-2 text-emerald-600" onClick={() => setMobileOpen(false)}>注册</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
