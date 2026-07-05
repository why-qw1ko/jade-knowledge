package com.jade.controller;

import com.jade.common.Result;
import com.jade.model.entity.Banner;
import com.jade.service.BannerService;
import com.jade.service.SystemConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(name = "轮播图（前台）")
@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;
    private final SystemConfigService systemConfigService;

    @Operation(summary = "获取启用的轮播图列表")
    @GetMapping
    public Result<List<Banner>> listActive() {
        return Result.success(bannerService.listActive());
    }

    @Operation(summary = "获取轮播图开关配置")
    @GetMapping("/config")
    public Result<Map<String, String>> getConfig() {
        String enabled = systemConfigService.getConfig("banner_enabled");
        return Result.success(Map.of("banner_enabled", enabled != null ? enabled : "false"));
    }
}
