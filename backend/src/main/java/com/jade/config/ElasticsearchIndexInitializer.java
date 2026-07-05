package com.jade.config;

import com.jade.service.ArticleSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 应用启动时自动同步文章到 Elasticsearch
 * 仅在 spring.elasticsearch.enabled=true 时激活
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.elasticsearch.enabled", havingValue = "true")
public class ElasticsearchIndexInitializer implements CommandLineRunner {

    private final ArticleSearchService articleSearchService;

    @Override
    public void run(String... args) {
        try {
            if (articleSearchService.isAvailable()) {
                log.info("Elasticsearch 可用，开始同步文章索引...");
                int count = articleSearchService.syncAll();
                log.info("文章索引同步完成，共 {} 篇", count);
            } else {
                log.warn("Elasticsearch 不可用，跳过索引同步");
            }
        } catch (Exception e) {
            log.error("Elasticsearch 索引同步失败", e);
        }
    }
}
