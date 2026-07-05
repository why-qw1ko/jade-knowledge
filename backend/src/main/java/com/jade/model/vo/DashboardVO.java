package com.jade.model.vo;

import lombok.Data;

import java.util.List;

/** 仪表盘统计数据 */
@Data
public class DashboardVO {
    private Long totalArticles;
    private Long totalUsers;
    private Long totalComments;
    private Long pendingArticles;
    private Long pendingComments;
    private Long todayNewArticles;
    private Long todayNewUsers;
    private Long todayNewComments;

    /** 分类文章数分布（饼图） */
    private List<CategoryStat> categoryStats;
    /** 文章状态分布（饼图） */
    private List<StatusStat> articleStatusStats;
    /** 近7天每日新增趋势（折线图） */
    private List<DayTrend> recentTrend;

    @Data
    public static class CategoryStat {
        private String name;
        private Long count;

        public CategoryStat(String name, Long count) {
            this.name = name;
            this.count = count;
        }
    }

    @Data
    public static class StatusStat {
        private String name;
        private Long count;

        public StatusStat(String name, Long count) {
            this.name = name;
            this.count = count;
        }
    }

    @Data
    public static class DayTrend {
        private String date;
        private Long articles;
        private Long users;
        private Long comments;

        public DayTrend(String date, Long articles, Long users, Long comments) {
            this.date = date;
            this.articles = articles;
            this.users = users;
            this.comments = comments;
        }
    }
}
