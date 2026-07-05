package com.jade.controller.admin;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.common.Result;
import com.jade.model.entity.CrawlResult;
import com.jade.model.entity.CrawlTask;
import com.jade.security.LoginUser;
import com.jade.service.AIService;
import com.jade.service.CrawlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

@Slf4j
@Tag(name = "后台AI抓取管理")
@RestController
@RequestMapping("/api/admin/crawl")
@RequiredArgsConstructor
public class AdminCrawlController {

    private final CrawlService crawlService;
    private final AIService aiService;
    private final ExecutorService sseExecutor = new ThreadPoolExecutor(
            2, 8, 60L, TimeUnit.SECONDS, new LinkedBlockingQueue<>(20),
            new ThreadPoolExecutor.CallerRunsPolicy());

    @Operation(summary = "手动触发抓取")
    @PostMapping("/trigger")
    public Result<Void> trigger(@RequestParam String keyword) {
        crawlService.triggerCrawl(keyword);
        return Result.success();
    }

    @Operation(summary = "AI生成文章（SSE流式）")
    @GetMapping(value = "/generate/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter generateStream(@RequestParam String prompt, @AuthenticationPrincipal LoginUser loginUser) {
        // 10分钟超时，覆盖 LLM 读取超时 (5min) + 余量
        SseEmitter emitter = new SseEmitter(600000L);

        // 心跳线程：每15秒发送 SSE 注释防止代理/网关断开空闲连接
        final boolean[] done = {false};
        Future<?> keepaliveFuture = sseExecutor.submit(() -> {
            while (!done[0]) {
                try {
                    Thread.sleep(15000);
                    if (!done[0]) {
                        emitter.send(SseEmitter.event().comment("keepalive"));
                    }
                } catch (Exception ignored) {
                    break;
                }
            }
        });

        sseExecutor.execute(() -> {
            try {
                emitter.send(SseEmitter.event().name("start").data("开始生成..."));

                StringBuilder content = new StringBuilder();

                aiService.streamGenerateArticle(prompt, chunk -> {
                    try {
                        String clean = chunk.replace("\0", "");
                        if (clean.isEmpty()) return;
                        content.append(clean);
                        emitter.send(SseEmitter.event().name("chunk").data(clean));
                    } catch (IOException e) {
                        log.warn("SSE发送chunk失败: {}", e.getMessage());
                        throw new RuntimeException(e);
                    }
                });

                String fullContent = content.toString();
                String title = prompt;
                String summary = "";

                String[] lines = fullContent.split("\n");
                for (String line : lines) {
                    String trimmed = line.trim();
                    if (trimmed.startsWith("# ") && title.equals(prompt)) {
                        title = trimmed.substring(2).trim();
                    }
                    if (trimmed.startsWith("摘要：") || trimmed.startsWith("摘要:")) {
                        summary = trimmed.substring(trimmed.indexOf("：") + 1).trim();
                    }
                }

                Long resultId = crawlService.saveGeneratedArticle(prompt, title, fullContent, summary, loginUser.getUserId());
                emitter.send(SseEmitter.event().name("done").data(resultId));
                emitter.complete();

            } catch (Exception e) {
                log.error("AI流式生成失败", e);
                try {
                    emitter.send(SseEmitter.event().name("error").data("生成失败: " + e.getMessage()));
                } catch (IOException ignored) {}
                emitter.completeWithError(e);
            } finally {
                done[0] = true;
                keepaliveFuture.cancel(true);
            }
        });

        emitter.onTimeout(() -> {
            log.warn("SSE超时（10分钟）");
            done[0] = true;
            keepaliveFuture.cancel(true);
            try {
                emitter.send(SseEmitter.event().name("error").data("生成超时，请减少内容长度后重试"));
            } catch (IOException ignored) {}
            emitter.complete();
        });
        emitter.onError(e -> {
            log.warn("SSE错误: {}", e.getMessage());
            done[0] = true;
            keepaliveFuture.cancel(true);
        });

        return emitter;
    }

    @Operation(summary = "AI生成文章（非流式，兼容旧接口）")
    @PostMapping("/generate")
    public Result<Long> generate(@RequestParam String prompt, @AuthenticationPrincipal LoginUser loginUser) {
        return Result.success(crawlService.generateArticle(prompt, loginUser.getUserId()));
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

    @Operation(summary = "删除任务")
    @DeleteMapping("/tasks/{id}")
    public Result<Void> deleteTask(@PathVariable Long id) {
        crawlService.deleteTask(id);
        return Result.success();
    }
}
