import { Gem, Github, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/', label: '首页' },
    { href: '/articles', label: '文章中心' },
    { href: '/search', label: '知识搜索' },
    { href: '/profile', label: '个人中心' },
  ];

  const serviceLinks = [
    { href: '#', label: '用户协议' },
    { href: '#', label: '隐私政策' },
    { href: '#', label: '帮助中心' },
    { href: '#', label: '意见反馈' },
  ];

  return (
    <footer style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Gem className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
              <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>玉石知识平台</span>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              专业的玉石知识分享与学习平台，致力于玉石文化的普及与传播，为您提供最全面的玉石鉴别、收藏与文化知识。
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                title="微信公众号"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@jade-knowledge.com"
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                title="联系我们"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>快速导航</h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>服务与支持</h4>
            <ul className="space-y-2 text-sm">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>联系我们</h4>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>contact@jade-knowledge.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>微信公众号：玉石知识平台</span>
              </li>
              <li className="mt-4">
                <p className="text-xs">工作时间：周一至周五 9:00-18:00</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--border-primary)', color: 'var(--text-muted)' }}
        >
          <p className="text-sm">
            © {currentYear} 玉石知识平台 All Rights Reserved
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="#"
              className="transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              用户协议
            </Link>
            <span>|</span>
            <Link
              href="#"
              className="transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              隐私政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
