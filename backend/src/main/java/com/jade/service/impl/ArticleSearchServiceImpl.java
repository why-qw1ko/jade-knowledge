package com.jade.service.impl;

import co.elastic.clients.elasticsearch._types.query_dsl.MultiMatchQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.data.domain.PageRequest;
import com.jade.mapper.ArticleMapper;
import com.jade.mapper.CategoryMapper;
import com.jade.mapper.UserMapper;
import com.jade.model.entity.Article;
import com.jade.model.entity.ArticleDocument;
import com.jade.model.entity.Category;
import com.jade.model.entity.User;
import com.jade.model.vo.ArticleVO;
import com.jade.repository.ArticleSearchRepository;
import com.jade.service.ArticleSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.client.elc.NativeQueryBuilder;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Elasticsearch 文章搜索服务实现
 * 仅在 app.elasticsearch.enabled=true 时激活
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.elasticsearch.enabled", havingValue = "true")
public class ArticleSearchServiceImpl implements ArticleSearchService {

    private final ArticleSearchRepository articleSearchRepository;
    private final ElasticsearchOperations elasticsearchOperations;
    private final ArticleMapper articleMapper;
    private final CategoryMapper categoryMapper;
    private final UserMapper userMapper;

    @Override
    public IPage<ArticleVO> search(String keyword, Integer pageNum, Integer pageSize) {
        try {
            Query multiMatchQuery = MultiMatchQuery.of(m -> m
                    .fields("title^3", "summary^2", "content", "tags^2", "categoryName")
                    .query(keyword)
                    .fuzziness("AUTO")
            )._toQuery();

            NativeQuery query = new NativeQueryBuilder()
                    .withQuery(multiMatchQuery)
                    .withPageable(PageRequest.of(pageNum - 1, pageSize))
                    .build();

            SearchHits<ArticleDocument> hits = elasticsearchOperations.search(query, ArticleDocument.class);

            List<ArticleVO> records = hits.getSearchHits().stream()
                    .map(hit -> {
                        ArticleDocument doc = hit.getContent();
                        ArticleVO vo = new ArticleVO();
                        vo.setId(doc.getId());
                        vo.setTitle(doc.getTitle());
                        vo.setSummary(doc.getSummary());
                        vo.setCoverImage(doc.getCoverImage());
                        vo.setStatus(doc.getStatus());
                        vo.setViewCount(doc.getViewCount());
                        vo.setLikeCount(doc.getLikeCount());
                        vo.setFavoriteCount(doc.getFavoriteCount());
                        vo.setCommentCount(doc.getCommentCount());
                        vo.setIsTop(doc.getIsTop());
                        vo.setCreateTime(doc.getCreateTime());
                        vo.setCategoryName(doc.getCategoryName());
                        vo.setAuthorName(doc.getAuthorName());
                        return vo;
                    })
                    .collect(Collectors.toList());

            Page<ArticleVO> result = new Page<>(pageNum, pageSize, hits.getTotalHits());
            result.setRecords(records);
            return result;
        } catch (Exception e) {
            log.error("ES 搜索失败，降级为 MySQL 搜索: {}", e.getMessage());
            // 降级为 MySQL FULLTEXT 搜索
            return articleMapper.selectArticleVOPage(new Page<>(pageNum, pageSize), null, keyword, 2);
        }
    }

    @Override
    public void indexArticle(ArticleDocument document) {
        try {
            articleSearchRepository.save(document);
            log.debug("文章索引成功: id={}", document.getId());
        } catch (Exception e) {
            log.error("文章索引失败: id={}", document.getId(), e);
        }
    }

    @Override
    public void deleteIndex(Long articleId) {
        try {
            articleSearchRepository.deleteById(articleId);
            log.debug("文章索引删除成功: id={}", articleId);
        } catch (Exception e) {
            log.error("文章索引删除失败: id={}", articleId, e);
        }
    }

    @Override
    public int syncAll() {
        log.info("开始全量同步文章到 Elasticsearch...");
        int count = 0;
        int pageNum = 1;
        int pageSize = 100;

        while (true) {
            List<Article> articles = articleMapper.selectList(
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Article>()
                            .eq(Article::getStatus, 2)
                            .last("LIMIT " + pageSize + " OFFSET " + (pageNum - 1) * pageSize));

            if (articles.isEmpty()) break;

            List<ArticleDocument> docs = new ArrayList<>();
            for (Article article : articles) {
                docs.add(toDocument(article));
            }

            articleSearchRepository.saveAll(docs);
            count += docs.size();
            log.info("已同步 {} 篇文章", count);

            if (articles.size() < pageSize) break;
            pageNum++;
        }

        log.info("全量同步完成，共 {} 篇文章", count);
        return count;
    }

    @Override
    public boolean isAvailable() {
        try {
            return elasticsearchOperations.indexOps(ArticleDocument.class).exists();
        } catch (Exception e) {
            log.warn("Elasticsearch 不可用: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 将 Article 实体转换为 ES 文档
     */
    public ArticleDocument toDocument(Article article) {
        ArticleDocument doc = new ArticleDocument();
        doc.setId(article.getId());
        doc.setTitle(article.getTitle());
        doc.setContent(article.getContent());
        doc.setSummary(article.getSummary());
        doc.setTags(article.getTags());
        doc.setCoverImage(article.getCoverImage());
        doc.setCategoryId(article.getCategoryId());
        doc.setAuthorId(article.getAuthorId());
        doc.setStatus(article.getStatus());
        doc.setViewCount(article.getViewCount());
        doc.setLikeCount(article.getLikeCount());
        doc.setFavoriteCount(article.getFavoriteCount());
        doc.setCommentCount(article.getCommentCount());
        doc.setIsTop(article.getIsTop());
        doc.setCreateTime(article.getCreateTime());

        // 查询分类名
        if (article.getCategoryId() != null) {
            try {
                Category category = categoryMapper.selectById(article.getCategoryId());
                if (category != null) doc.setCategoryName(category.getName());
            } catch (Exception ignored) {}
        }

        // 查询作者名
        if (article.getAuthorId() != null) {
            try {
                User author = userMapper.selectById(article.getAuthorId());
                if (author != null) doc.setAuthorName(author.getNickname());
            } catch (Exception ignored) {}
        }

        return doc;
    }
}
