package com.jade.ai;

import com.jade.mapper.CrawlTaskMapper;
import com.jade.model.entity.CrawlTask;
import com.jade.service.CrawlService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;

/**
 * 定时抓取调度器
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CrawlScheduler {

    private final CrawlTaskMapper crawlTaskMapper;
    private final CrawlService crawlService;

    /** 每天凌晨3点检查待执行的抓取任务 */
    @Scheduled(cron = "${crawl.schedule:0 0 3 * * ?}")
    public void executeScheduledCrawls() {
        log.info("开始执行定时抓取任务...");
        var tasks = crawlTaskMapper.selectList(
                new LambdaQueryWrapper<CrawlTask>().eq(CrawlTask::getStatus, 0));
        for (CrawlTask task : tasks) {
            try {
                crawlService.triggerCrawl(task.getName().replace("抓取-", ""));
            } catch (Exception e) {
                log.error("抓取任务执行失败: {}", task.getName(), e);
            }
        }
    }
}
