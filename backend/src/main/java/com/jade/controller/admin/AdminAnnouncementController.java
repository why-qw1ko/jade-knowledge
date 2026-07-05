package com.jade.controller.admin;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.common.Result;
import com.jade.model.entity.Announcement;
import com.jade.security.LoginUser;
import com.jade.service.AnnouncementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "后台公告管理")
@RestController
@RequestMapping("/api/admin/announcements")
@RequiredArgsConstructor
public class AdminAnnouncementController {

    private final AnnouncementService announcementService;

    @Operation(summary = "公告列表（管理）")
    @GetMapping
    public Result<IPage<Announcement>> adminList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status) {
        return Result.success(announcementService.adminList(pageNum, pageSize, status));
    }

    @Operation(summary = "公告详情（管理）")
    @GetMapping("/{id}")
    public Result<Announcement> getById(@PathVariable Long id) {
        return Result.success(announcementService.adminGetById(id));
    }

    @Operation(summary = "创建公告")
    @PostMapping
    public Result<Long> create(@RequestBody Announcement announcement,
                               @AuthenticationPrincipal LoginUser loginUser) {
        return Result.success(announcementService.create(announcement, loginUser.getUserId()));
    }

    @Operation(summary = "更新公告")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody Announcement announcement) {
        announcementService.update(id, announcement);
        return Result.success();
    }

    @Operation(summary = "更新公告状态")
    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        announcementService.updateStatus(id, status);
        return Result.success();
    }

    @Operation(summary = "删除公告")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return Result.success();
    }
}
