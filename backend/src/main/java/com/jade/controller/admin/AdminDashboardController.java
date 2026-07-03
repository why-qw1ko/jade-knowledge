package com.jade.controller.admin;

import com.jade.common.Result;
import com.jade.model.vo.DashboardVO;
import com.jade.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "后台仪表盘")
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "获取统计数据")
    @GetMapping("/stats")
    public Result<DashboardVO> getStats() {
        return Result.success(dashboardService.getStats());
    }
}
