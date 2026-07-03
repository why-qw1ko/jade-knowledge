import { Gem } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Gem className="w-6 h-6 text-emerald-400" />
              <span className="text-lg font-bold text-white">玉石知识平台</span>
            </div>
            <p className="text-sm">专业的翡翠知识分享与学习平台，为您提供最全面的玉石鉴别、收藏与文化知识。</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">快速链接</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/articles" className="hover:text-emerald-400 transition-colors">文章</Link></li>
              <li><Link href="/search" className="hover:text-emerald-400 transition-colors">搜索</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">关于我们</h4>
            <ul className="space-y-2 text-sm">
              <li>致力于玉石知识的普及与传播</li>
              <li>联系邮箱: contact@jade-knowledge.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          © {new Date().getFullYear()} 玉石知识平台. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
