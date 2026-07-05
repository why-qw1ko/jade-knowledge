package com.jade.controller.admin;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.common.Result;
import com.jade.model.entity.Banner;
import com.jade.service.BannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "后台轮播图管理")
@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
public class AdminBannerController {

    private final BannerService bannerService;

    @Operation(summary = "轮播图列表")
    @GetMapping
    public Result<IPage<Banner>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(bannerService.adminList(pageNum, pageSize));
    }

    @Operation(summary = "轮播图详情")
    @GetMapping("/{id}")
    public Result<Banner> getById(@PathVariable Long id) {
        return Result.success(bannerService.getById(id));
    }

    @Operation(summary = "创建轮播图")
    @PostMapping
    public Result<Long> create(@RequestBody Banner banner) {
        return Result.success(bannerService.create(banner));
    }

    @Operation(summary = "更新轮播图")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody Banner banner) {
        bannerService.update(id, banner);
        return Result.success();
    }

    @Operation(summary = "删除轮播图")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        bannerService.delete(id);
        return Result.success();
    }
}
