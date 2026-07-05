package com.jade.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.model.entity.Announcement;

import java.util.List;

public interface AnnouncementService {

    /**
     * 前台列表 - 已发布的公告
     */
    IPage<Announcement> listPublished(Integer pageNum, Integer pageSize);

    /**
     * 前台获取最新公告（用于首页滚动展示）
     */
    List<Announcement> getLatestAnnouncements(int limit);

    /**
     * 根据ID获取公告详情（前台，只返回已发布）
     */
    Announcement getById(Long id);

    /**
     * 根据ID获取公告详情（后台管理，不受状态限制）
     */
    Announcement adminGetById(Long id);

    /**
     * 后台管理列表
     */
    IPage<Announcement> adminList(Integer pageNum, Integer pageSize, Integer status);

    /**
     * 创建公告
     */
    Long create(Announcement announcement, Long authorId);

    /**
     * 更新公告
     */
    void update(Long id, Announcement announcement);

    /**
     * 更新公告状态
     */
    void updateStatus(Long id, Integer status);

    /**
     * 删除公告
     */
    void delete(Long id);
}
