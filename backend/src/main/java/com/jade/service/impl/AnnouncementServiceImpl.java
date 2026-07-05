package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jade.common.BusinessException;
import com.jade.mapper.AnnouncementMapper;
import com.jade.model.entity.Announcement;
import com.jade.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementMapper announcementMapper;

    @Override
    public IPage<Announcement> listPublished(Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<Announcement> wrapper = new LambdaQueryWrapper<Announcement>()
                .eq(Announcement::getStatus, 1)
                .orderByDesc(Announcement::getIsTop)
                .orderByDesc(Announcement::getPublishTime);
        return announcementMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public List<Announcement> getLatestAnnouncements(int limit) {
        return announcementMapper.selectList(
                new LambdaQueryWrapper<Announcement>()
                        .eq(Announcement::getStatus, 1)
                        .orderByDesc(Announcement::getIsTop)
                        .orderByDesc(Announcement::getPublishTime)
                        .last("LIMIT " + limit));
    }

    @Override
    public Announcement getById(Long id) {
        Announcement announcement = announcementMapper.selectById(id);
        if (announcement == null || announcement.getStatus() != 1) {
            throw new BusinessException("公告不存在或未发布");
        }
        return announcement;
    }

    @Override
    public Announcement adminGetById(Long id) {
        Announcement announcement = announcementMapper.selectById(id);
        if (announcement == null) {
            throw new BusinessException("公告不存在");
        }
        return announcement;
    }

    @Override
    public IPage<Announcement> adminList(Integer pageNum, Integer pageSize, Integer status) {
        LambdaQueryWrapper<Announcement> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(Announcement::getStatus, status);
        }
        wrapper.orderByDesc(Announcement::getCreateTime);
        return announcementMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Long create(Announcement announcement, Long authorId) {
        announcement.setAuthorId(authorId);
        announcement.setDeleted(0);
        if (announcement.getStatus() == null) {
            announcement.setStatus(0);
        }
        if (announcement.getIsTop() == null) {
            announcement.setIsTop(0);
        }
        if (announcement.getType() == null) {
            announcement.setType(0);
        }
        // 如果是发布状态，设置发布时间
        if (announcement.getStatus() == 1 && announcement.getPublishTime() == null) {
            announcement.setPublishTime(LocalDateTime.now());
        }
        announcementMapper.insert(announcement);
        return announcement.getId();
    }

    @Override
    public void update(Long id, Announcement announcement) {
        Announcement existing = announcementMapper.selectById(id);
        if (existing == null) {
            throw new BusinessException("公告不存在");
        }
        if (announcement.getTitle() != null) existing.setTitle(announcement.getTitle());
        if (announcement.getContent() != null) existing.setContent(announcement.getContent());
        if (announcement.getType() != null) existing.setType(announcement.getType());
        if (announcement.getIsTop() != null) existing.setIsTop(announcement.getIsTop());
        if (announcement.getStatus() != null) {
            // 如果状态变为发布且没有发布时间，设置发布时间
            if (announcement.getStatus() == 1 && existing.getPublishTime() == null) {
                existing.setPublishTime(LocalDateTime.now());
            }
            existing.setStatus(announcement.getStatus());
        }
        announcementMapper.updateById(existing);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        Announcement announcement = announcementMapper.selectById(id);
        if (announcement == null) {
            throw new BusinessException("公告不存在");
        }
        if (status == 1 && announcement.getPublishTime() == null) {
            announcement.setPublishTime(LocalDateTime.now());
        }
        announcement.setStatus(status);
        announcementMapper.updateById(announcement);
    }

    @Override
    public void delete(Long id) {
        announcementMapper.deleteById(id);
    }
}
