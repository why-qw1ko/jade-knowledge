package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jade.mapper.*;
import com.jade.model.entity.*;
import com.jade.model.vo.ArticleVO;
import com.jade.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteMapper favoriteMapper;
    private final ArticleMapper articleMapper;
    private final CategoryMapper categoryMapper;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public boolean toggle(Long userId, Long articleId) {
        LambdaQueryWrapper<Favorite> wrapper = new LambdaQueryWrapper<Favorite>()
                .eq(Favorite::getUserId, userId)
                .eq(Favorite::getArticleId, articleId);
        Long count = favoriteMapper.selectCount(wrapper);
        if (count > 0) {
            // 取消收藏
            favoriteMapper.delete(wrapper);
            articleMapper.update(null, new LambdaUpdateWrapper<Article>()
                    .eq(Article::getId, articleId)
                    .setSql("favorite_count = GREATEST(favorite_count - 1, 0)"));
            return false;
        } else {
            // 收藏
            Favorite fav = new Favorite();
            fav.setUserId(userId);
            fav.setArticleId(articleId);
            favoriteMapper.insert(fav);
            articleMapper.update(null, new LambdaUpdateWrapper<Article>()
                    .eq(Article::getId, articleId)
                    .setSql("favorite_count = favorite_count + 1"));
            return true;
        }
    }

    @Override
    public IPage<ArticleVO> listByUser(Long userId, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<Favorite> wrapper = new LambdaQueryWrapper<Favorite>()
                .eq(Favorite::getUserId, userId)
                .orderByDesc(Favorite::getCreateTime);
        IPage<Favorite> favPage = favoriteMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);

        return favPage.convert(fav -> {
            Article article = articleMapper.selectById(fav.getArticleId());
            if (article == null) return null;
            ArticleVO vo = new ArticleVO();
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
            if (article.getCategoryId() != null) {
                Category cat = categoryMapper.selectById(article.getCategoryId());
                if (cat != null) vo.setCategoryName(cat.getName());
            }
            if (article.getAuthorId() != null) {
                User author = userMapper.selectById(article.getAuthorId());
                if (author != null) vo.setAuthorName(author.getNickname());
            }
            return vo;
        });
    }

    @Override
    public boolean isFavorited(Long userId, Long articleId) {
        Long count = favoriteMapper.selectCount(
                new LambdaQueryWrapper<Favorite>()
                        .eq(Favorite::getUserId, userId)
                        .eq(Favorite::getArticleId, articleId));
        return count > 0;
    }
}
