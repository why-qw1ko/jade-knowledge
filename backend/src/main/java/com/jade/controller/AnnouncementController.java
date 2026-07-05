package com.jade.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.common.Result;
import com.jade.model.entity.Announcement;
import com.jade.service.AnnouncementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "公告接口")
@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @Operation(summary = "公告列表（已发布）")
    @GetMapping
    public Result<IPage<Announcement>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(announcementService.listPublished(pageNum, pageSize));
    }

    @Operation(summary = "最新公告（首页滚动展示）")
    @GetMapping("/latest")
    public Result<List<Announcement>> getLatest(
            @RequestParam(defaultValue = "5") Integer limit) {
        return Result.success(announcementService.getLatestAnnouncements(limit));
    }

    @Operation(summary = "公告详情")
    @GetMapping("/{id}")
    public Result<Announcement> getById(@PathVariable Long id) {
        return Result.success(announcementService.getById(id));
    }
}
