package com.jade.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * 条件化启用 Elasticsearch 仓库扫描
 * 仅在 app.elasticsearch.enabled=true 时激活。
 * ES 客户端与 ElasticsearchTemplate 由 Spring Boot 自动配置创建，
 * 此处只需控制 @EnableElasticsearchRepositories 的激活即可。
 */
@Configuration
@ConditionalOnProperty(name = "app.elasticsearch.enabled", havingValue = "true")
@EnableElasticsearchRepositories(basePackages = "com.jade.repository")
public class ElasticsearchConfig {
}
