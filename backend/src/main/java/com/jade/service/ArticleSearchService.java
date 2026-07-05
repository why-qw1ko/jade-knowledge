package com.jade.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.model.entity.ArticleDocument;
import com.jade.model.vo.ArticleVO;

import java.util.List;

/**
 * Elasticsearch 文章搜索服务接口
 */
public interface ArticleSearchService {

    /**
     * ES 全文搜索
     */
    IPage<ArticleVO> search(String keyword, Integer pageNum, Integer pageSize);

    /**
     * 索引单篇文章
     */
    void indexArticle(ArticleDocument document);

    /**
     * 删除索引
     */
    void deleteIndex(Long articleId);

    /**
     * 全量同步所有已发布文章到 ES
     */
    int syncAll();

    /**
     * ES 是否可用
     */
    boolean isAvailable();
}
