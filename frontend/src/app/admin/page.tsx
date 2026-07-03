'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/admin/StatsCard';
import { adminApi } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    adminApi.getStats().then((res: any) => {
      if (res.code === 200) setStats(res.data);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="文章总数" value={stats.totalArticles || 0} icon="articles" />
        <StatsCard title="用户总数" value={stats.totalUsers || 0} icon="users" color="blue" />
        <StatsCard title="评论总数" value={stats.totalComments || 0} icon="comments" color="yellow" />
        <StatsCard title="待审文章" value={stats.pendingArticles || 0} icon="pending" color="red" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <StatsCard title="今日新文章" value={stats.todayNewArticles || 0} icon="articles" />
        <StatsCard title="今日新用户" value={stats.todayNewUsers || 0} icon="users" color="blue" />
        <StatsCard title="今日新评论" value={stats.todayNewComments || 0} icon="comments" color="yellow" />
      </div>
    </div>
  );
}
