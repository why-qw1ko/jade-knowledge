package com.jade.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jade.mapper.ArticleMapper;
import com.jade.model.entity.ArticleDocument;
import com.jade.model.vo.ArticleVO;
import com.jade.service.ArticleSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * 搜索服务降级实现 — 使用 MySQL FULLTEXT 搜索
 * 当 ES 未启用时（spring.elasticsearch.enabled != true）自动激活
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.elasticsearch.enabled", havingValue = "false", matchIfMissing = true)
public class ArticleSearchFallbackImpl implements ArticleSearchService {

    private final ArticleMapper articleMapper;

    @Override
    public IPage<ArticleVO> search(String keyword, Integer pageNum, Integer pageSize) {
        // 降级为 MySQL FULLTEXT 搜索
        return articleMapper.selectArticleVOPage(new Page<>(pageNum, pageSize), null, keyword, 2);
    }

    @Override
    public void indexArticle(ArticleDocument document) {
        // 降级时不做任何操作
        log.debug("ES 未启用，跳过文章索引: id={}", document.getId());
    }

    @Override
    public void deleteIndex(Long articleId) {
        log.debug("ES 未启用，跳过索引删除: id={}", articleId);
    }

    @Override
    public int syncAll() {
        log.warn("ES 未启用，无法执行全量同步");
        return 0;
    }

    @Override
    public boolean isAvailable() {
        return false;
    }
}
