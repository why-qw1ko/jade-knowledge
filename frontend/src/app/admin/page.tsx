'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { StatsCard } from '@/components/admin/StatsCard';
import { adminApi } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { LayoutDashboard } from 'lucide-react';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface CategoryStat { name: string; count: number; }
interface StatusStat { name: string; count: number; }
interface DayTrend { date: string; articles: number; users: number; comments: number; }

interface DashboardData {
  totalArticles: number;
  totalUsers: number;
  totalComments: number;
  pendingArticles: number;
  pendingComments: number;
  todayNewArticles: number;
  todayNewUsers: number;
  todayNewComments: number;
  categoryStats: CategoryStat[];
  articleStatusStats: StatusStat[];
  recentTrend: DayTrend[];
}

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const { resolvedTheme } = useAppStore();

  useEffect(() => {
    adminApi.getStats().then((res: any) => {
      if (res.code === 200) setStats(res.data);
    });
  }, []);

  const textColor = resolvedTheme === 'dark' ? '#d1d5db' : '#6b7280';
  const borderColor = resolvedTheme === 'dark' ? '#374151' : '#e5e7eb';

  const categoryOption = useMemo(() => {
    if (!stats?.categoryStats?.length) return null;
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c}篇 ({d}%)' },
      legend: { bottom: 0, textStyle: { color: textColor, fontSize: 12 } },
      color: PIE_COLORS,
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: stats.categoryStats.map(c => ({ name: c.name || '未分类', value: c.count })),
      }],
    };
  }, [stats?.categoryStats, textColor, resolvedTheme]);

  const statusOption = useMemo(() => {
    if (!stats?.articleStatusStats?.length) return null;
    const statusColors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c}篇 ({d}%)' },
      legend: { bottom: 0, textStyle: { color: textColor, fontSize: 12 } },
      color: statusColors,
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: stats.articleStatusStats.map(s => ({ name: s.name, value: s.count })),
      }],
    };
  }, [stats?.articleStatusStats, textColor, resolvedTheme]);

  const trendOption = useMemo(() => {
    if (!stats?.recentTrend?.length) return null;
    return {
      tooltip: { trigger: 'axis' },
      legend: { top: 0, textStyle: { color: textColor, fontSize: 12 } },
      grid: { top: 36, right: 16, bottom: 28, left: 40 },
      xAxis: {
        type: 'category',
        data: stats.recentTrend.map(d => d.date),
        axisLine: { lineStyle: { color: borderColor } },
        axisLabel: { color: textColor, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: borderColor, type: 'dashed' } },
        axisLabel: { color: textColor, fontSize: 11 },
      },
      color: ['#10b981', '#3b82f6', '#f59e0b'],
      series: [
        { name: '文章', type: 'line', smooth: true, data: stats.recentTrend.map(d => d.articles), areaStyle: { opacity: 0.15 } },
        { name: '用户', type: 'line', smooth: true, data: stats.recentTrend.map(d => d.users), areaStyle: { opacity: 0.15 } },
        { name: '评论', type: 'line', smooth: true, data: stats.recentTrend.map(d => d.comments), areaStyle: { opacity: 0.15 } },
      ],
    };
  }, [stats?.recentTrend, textColor, borderColor]);

  return (
    <div className="flex flex-col h-full p-4 md:p-8 overflow-hidden">
      <div className="flex items-center gap-2 mb-6 flex-shrink-0">
        <LayoutDashboard className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>仪表盘</h1>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="文章总数" value={stats?.totalArticles || 0} icon="articles" />
          <StatsCard title="用户总数" value={stats?.totalUsers || 0} icon="users" color="blue" />
          <StatsCard title="评论总数" value={stats?.totalComments || 0} icon="comments" color="yellow" />
          <StatsCard title="待审文章" value={stats?.pendingArticles || 0} icon="pending" color="red" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="今日新文章" value={stats?.todayNewArticles || 0} icon="articles" />
          <StatsCard title="今日新用户" value={stats?.todayNewUsers || 0} icon="users" color="blue" />
          <StatsCard title="今日新评论" value={stats?.todayNewComments || 0} icon="comments" color="yellow" />
        </div>

        {/* 图表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 分类分布饼图 */}
          <div className="rounded-lg p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>文章分类分布</h3>
            {categoryOption ? (
              <ReactECharts option={categoryOption} style={{ height: 280 }} opts={{ renderer: 'svg' }} />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>暂无数据</div>
            )}
          </div>

          {/* 文章状态饼图 */}
          <div className="rounded-lg p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>文章状态分布</h3>
            {statusOption ? (
              <ReactECharts option={statusOption} style={{ height: 280 }} opts={{ renderer: 'svg' }} />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>暂无数据</div>
            )}
          </div>
        </div>

        {/* 趋势折线图 */}
        <div className="rounded-lg p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>近7天新增趋势</h3>
          {trendOption ? (
            <ReactECharts option={trendOption} style={{ height: 300 }} opts={{ renderer: 'svg' }} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>暂无数据</div>
          )}
        </div>
      </div>
    </div>
  );
}
