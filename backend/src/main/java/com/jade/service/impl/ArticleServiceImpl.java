package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jade.common.BusinessException;
import com.jade.mapper.*;
import com.jade.model.dto.ArticleDTO;
import com.jade.model.entity.*;
import com.jade.model.vo.ArticleDetailVO;
import com.jade.model.vo.ArticleVO;
import com.jade.security.SecurityUtils;
import com.jade.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private final ArticleMapper articleMapper;
    private final CategoryMapper categoryMapper;
    private final UserMapper userMapper;
    private final FavoriteMapper favoriteMapper;
    private final ArticleImageMapper articleImageMapper;
    private final ArticleVideoMapper articleVideoMapper;

    @Override
    public IPage<ArticleVO> list(Integer pageNum, Integer pageSize, Long categoryId, String keyword, Integer status) {
        Integer actualStatus = status != null ? status : 2; // 默认只看已发布
        return articleMapper.selectArticleVOPage(new Page<>(pageNum, pageSize), categoryId, keyword, actualStatus);
    }

    @Override
    public ArticleDetailVO getDetail(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null || article.getStatus() != 2) {
            throw new BusinessException("文章不存在或未发布");
        }
        // 增加浏览量
        articleMapper.update(null, new LambdaUpdateWrapper<Article>()
                .eq(Article::getId, id).setSql("view_count = view_count + 1"));
        return toDetailVO(article, true);
    }

    @Override
    public IPage<ArticleVO> adminList(Integer pageNum, Integer pageSize, String keyword, Integer status, Long categoryId) {
        return articleMapper.selectArticleVOPage(new Page<>(pageNum, pageSize), categoryId, keyword, status);
    }

    @Override
    public ArticleDetailVO adminGetDetail(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) throw new BusinessException("文章不存在");
        return toDetailVO(article, false);
    }

    @Override
    @Transactional
    public Long create(ArticleDTO dto, Long authorId) {
        Article article = new Article();
        article.setTitle(dto.getTitle());
        article.setContent(dto.getContent());
        article.setSummary(dto.getSummary());
        article.setCoverImage(dto.getCoverImage());
        article.setCategoryId(dto.getCategoryId());
        article.setAuthorId(authorId);
        article.setSource(dto.getSource());
        article.setSourceUrl(dto.getSourceUrl());
        article.setIsTop(dto.getIsTop() != null ? dto.getIsTop() : 0);
        article.setStatus(dto.getStatus() != null ? dto.getStatus() : 0);
        article.setViewCount(0L);
        article.setLikeCount(0L);
        article.setFavoriteCount(0L);
        article.setCommentCount(0L);
        articleMapper.insert(article);
        return article.getId();
    }

    @Override
    @Transactional
    public void update(Long id, ArticleDTO dto) {
        Article article = articleMapper.selectById(id);
        if (article == null) throw new BusinessException("文章不存在");
        if (StringUtils.hasText(dto.getTitle())) article.setTitle(dto.getTitle());
        if (dto.getContent() != null) article.setContent(dto.getContent());
        if (dto.getSummary() != null) article.setSummary(dto.getSummary());
        if (dto.getCoverImage() != null) article.setCoverImage(dto.getCoverImage());
        if (dto.getCategoryId() != null) article.setCategoryId(dto.getCategoryId());
        if (dto.getSource() != null) article.setSource(dto.getSource());
        if (dto.getSourceUrl() != null) article.setSourceUrl(dto.getSourceUrl());
        if (dto.getIsTop() != null) article.setIsTop(dto.getIsTop());
        if (dto.getStatus() != null) article.setStatus(dto.getStatus());
        articleMapper.updateById(article);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        Article article = articleMapper.selectById(id);
        if (article == null) throw new BusinessException("文章不存在");
        article.setStatus(status);
        articleMapper.updateById(article);
    }

    @Override
    public void delete(Long id) {
        articleMapper.deleteById(id);
    }

    @Override
    public IPage<ArticleVO> search(String keyword, Integer pageNum, Integer pageSize) {
        return articleMapper.selectArticleVOPage(new Page<>(pageNum, pageSize), null, keyword, 2);
    }

    private ArticleDetailVO toDetailVO(Article article, boolean checkFavorite) {
        ArticleDetailVO vo = new ArticleDetailVO();
        vo.setId(article.getId());
        vo.setTitle(article.getTitle());
        vo.setSummary(article.getSummary());
        vo.setCoverImage(article.getCoverImage());
        vo.setStatus(article.getStatus());
        vo.setViewCount(article.getViewCount());
        vo.setLikeCount(article.getLikeCount());
        vo.setFavoriteCount(article.getFavoriteCount());
        vo.setCommentCount(article.getCommentCount());
        vo.setIsTop(article.getIsTop());
        vo.setCreateTime(article.getCreateTime());
        vo.setContent(article.getContent());
        vo.setSource(article.getSource());
        vo.setSourceUrl(article.getSourceUrl());

        // 分类名
        if (article.getCategoryId() != null) {
            Category cat = categoryMapper.selectById(article.getCategoryId());
            if (cat != null) vo.setCategoryName(cat.getName());
        }
        // 作者名
        if (article.getAuthorId() != null) {
            User author = userMapper.selectById(article.getAuthorId());
            if (author != null) vo.setAuthorName(author.getNickname());
        }
        // 是否收藏
        if (checkFavorite) {
            Long currentUserId = SecurityUtils.getCurrentUserId();
            if (currentUserId != null) {
                Long count = favoriteMapper.selectCount(new LambdaQueryWrapper<Favorite>()
                        .eq(Favorite::getUserId, currentUserId)
                        .eq(Favorite::getArticleId, article.getId()));
                vo.setIsFavorited(count > 0);
            }
        }
        return vo;
    }
}
