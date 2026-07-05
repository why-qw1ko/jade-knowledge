package com.jade.repository;

import com.jade.model.entity.ArticleDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

/**
 * Elasticsearch 文章搜索仓库
 */
public interface ArticleSearchRepository extends ElasticsearchRepository<ArticleDocument, Long> {

    /**
     * 按标题搜索（IK 分词）
     */
    List<ArticleDocument> findByTitleContaining(String keyword);

    /**
     * 按标题或内容搜索（IK 分词）
     */
    List<ArticleDocument> findByTitleContainingOrContentContaining(String title, String content);
}
