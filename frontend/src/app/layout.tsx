import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '玉石知识平台 - 翡翠鉴别、收藏与文化',
  description: '专业的翡翠知识分享与学习平台，为您提供最全面的玉石鉴别、收藏与文化知识。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col bg-gray-50">
        {children}
      </body>
    </html>
  );
}
