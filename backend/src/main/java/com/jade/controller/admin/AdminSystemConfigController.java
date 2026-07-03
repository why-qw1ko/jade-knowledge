package com.jade.controller.admin;

import com.jade.common.Result;
import com.jade.service.SystemConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "后台系统配置")
@RestController
@RequestMapping("/api/admin/system-config")
@RequiredArgsConstructor
public class AdminSystemConfigController {

    private final SystemConfigService systemConfigService;

    @Operation(summary = "获取所有配置")
    @GetMapping
    public Result<Map<String, String>> getAll() {
        return Result.success(systemConfigService.getAllConfigs());
    }

    @Operation(summary = "更新配置")
    @PutMapping
    public Result<Void> update(@RequestBody Map<String, String> configs) {
        systemConfigService.updateConfigs(configs);
        return Result.success();
    }
}
