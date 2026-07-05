package com.jade.controller.admin;

import com.jade.common.Result;
import com.jade.service.ArticleSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 后台搜索管理（ES 索引同步）
 */
@Tag(name = "后台搜索管理")
@RestController
@RequestMapping("/api/admin/search")
@RequiredArgsConstructor
public class AdminSearchController {

    private final ArticleSearchService articleSearchService;

    @Operation(summary = "全量同步文章到 ES")
    @PostMapping("/sync")
    public Result<Map<String, Object>> sync() {
        int count = articleSearchService.syncAll();
        boolean available = articleSearchService.isAvailable();
        return Result.success(Map.of(
                "synced", count,
                "esAvailable", available
        ));
    }

    @Operation(summary = "检查 ES 状态")
    @GetMapping("/status")
    public Result<Map<String, Object>> status() {
        boolean available = articleSearchService.isAvailable();
        return Result.success(Map.of("esAvailable", available));
    }
}
