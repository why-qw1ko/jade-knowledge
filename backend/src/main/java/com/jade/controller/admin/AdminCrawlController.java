package com.jade.controller.admin;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.common.Result;
import com.jade.model.entity.CrawlResult;
import com.jade.model.entity.CrawlTask;
import com.jade.security.LoginUser;
import com.jade.service.CrawlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "后台AI抓取管理")
@RestController
@RequestMapping("/api/admin/crawl")
@RequiredArgsConstructor
public class AdminCrawlController {

    private final CrawlService crawlService;

    @Operation(summary = "手动触发抓取")
    @PostMapping("/trigger")
    public Result<Void> trigger(@RequestParam String keyword) {
        crawlService.triggerCrawl(keyword);
        return Result.success();
    }

    @Operation(summary = "抓取结果列表")
    @GetMapping("/results")
    public Result<IPage<CrawlResult>> listResults(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status) {
        return Result.success(crawlService.listResults(pageNum, pageSize, status));
    }

    @Operation(summary = "审核通过")
    @PostMapping("/results/{id}/approve")
    public Result<Void> approve(@PathVariable Long id, @AuthenticationPrincipal LoginUser loginUser) {
        crawlService.approveResult(id, loginUser.getUserId());
        return Result.success();
    }

    @Operation(summary = "审核驳回")
    @PostMapping("/results/{id}/reject")
    public Result<Void> reject(@PathVariable Long id, @RequestBody(required = false) com.jade.model.dto.CrawlResultDTO dto,
                               @AuthenticationPrincipal LoginUser loginUser) {
        crawlService.rejectResult(id, loginUser.getUserId(), dto != null ? dto.getAuditRemark() : null);
        return Result.success();
    }

    @Operation(summary = "发布为文章")
    @PostMapping("/results/{id}/publish")
    public Result<Long> publish(@PathVariable Long id, @AuthenticationPrincipal LoginUser loginUser) {
        return Result.success(crawlService.publishResult(id, loginUser.getUserId()));
    }

    @Operation(summary = "任务列表")
    @GetMapping("/tasks")
    public Result<IPage<CrawlTask>> listTasks(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(crawlService.listTasks(pageNum, pageSize));
    }
}
