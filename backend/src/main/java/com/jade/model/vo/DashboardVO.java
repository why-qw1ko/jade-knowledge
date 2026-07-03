package com.jade.model.vo;

import lombok.Data;

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
}
