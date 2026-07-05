package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jade.common.BusinessException;
import com.jade.mapper.*;
import com.jade.model.dto.ArticleDTO;
import com.jade.model.dto.VideoDTO;
import com.jade.model.entity.*;
import com.jade.model.vo.ArticleDetailVO;
import com.jade.model.vo.ArticleVO;
import com.jade.security.SecurityUtils;
import com.jade.service.ArticleSearchService;
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
    private final CommentMapper commentMapper;
    private final ArticleImageMapper articleImageMapper;
    private final ArticleVideoMapper articleVideoMapper;
    private final ArticleSearchService articleSearchService;

    /** 默认封面图片URL */
    private static final String DEFAULT_COVER_IMAGE = "/upload/default.png";

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
        article.setContentFormat(dto.getContentFormat() != null ? dto.getContentFormat() : "markdown");

        // 如果没有填写摘要，自动提取前200字
        if (StringUtils.hasText(dto.getSummary())) {
            article.setSummary(dto.getSummary());
        } else {
            article.setSummary(extractSummary(dto.getContent(), dto.getTitle()));
        }

        // 如果没有上传封面，使用默认封面
        article.setCoverImage(StringUtils.hasText(dto.getCoverImage()) ? dto.getCoverImage() : DEFAULT_COVER_IMAGE);
        article.setCategoryId(dto.getCategoryId());
        article.setAuthorId(authorId);
        article.setTags(dto.getTags());
        article.setSource(dto.getSource());
        article.setSourceUrl(dto.getSourceUrl());
        article.setIsTop(dto.getIsTop() != null ? dto.getIsTop() : 0);
        article.setStatus(dto.getStatus() != null ? dto.getStatus() : 0);
        article.setViewCount(0L);
        article.setLikeCount(0L);
        article.setFavoriteCount(0L);
        article.setCommentCount(0L);
        articleMapper.insert(article);

        // 保存文章图片
        saveImages(article.getId(), dto.getImages());
        // 保存文章视频
        saveVideos(article.getId(), dto.getVideos());

        return article.getId();
    }

    @Override
    @Transactional
    public void update(Long id, ArticleDTO dto) {
        Article article = articleMapper.selectById(id);
        if (article == null) throw new BusinessException("文章不存在");
        if (StringUtils.hasText(dto.getTitle())) article.setTitle(dto.getTitle());
        if (dto.getContent() != null) article.setContent(dto.getContent());
        if (dto.getContentFormat() != null) article.setContentFormat(dto.getContentFormat());
        if (dto.getSummary() != null) article.setSummary(dto.getSummary());
        if (dto.getCoverImage() != null) article.setCoverImage(dto.getCoverImage());
        if (dto.getCategoryId() != null) article.setCategoryId(dto.getCategoryId());
        if (dto.getTags() != null) article.setTags(dto.getTags());
        if (dto.getSource() != null) article.setSource(dto.getSource());
        if (dto.getSourceUrl() != null) article.setSourceUrl(dto.getSourceUrl());
        if (dto.getIsTop() != null) article.setIsTop(dto.getIsTop());
        if (dto.getStatus() != null) article.setStatus(dto.getStatus());
        articleMapper.updateById(article);

        // 更新图片：先删后建
        if (dto.getImages() != null) {
            articleImageMapper.delete(new LambdaQueryWrapper<ArticleImage>()
                    .eq(ArticleImage::getArticleId, id));
            saveImages(id, dto.getImages());
        }
        // 更新视频：先删后建
        if (dto.getVideos() != null) {
            articleVideoMapper.delete(new LambdaQueryWrapper<ArticleVideo>()
                    .eq(ArticleVideo::getArticleId, id));
            saveVideos(id, dto.getVideos());
        }
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
        // 检查文章是否有评论
        Long commentCount = commentMapper.selectCount(
                new LambdaQueryWrapper<Comment>().eq(Comment::getArticleId, id));
        if (commentCount > 0) {
            throw new BusinessException("该文章下有 " + commentCount + " 条评论，请先删除评论后再删除文章");
        }

        // 检查文章是否有收藏
        Long favoriteCount = favoriteMapper.selectCount(
                new LambdaQueryWrapper<Favorite>().eq(Favorite::getArticleId, id));
        if (favoriteCount > 0) {
            throw new BusinessException("该文章已被 " + favoriteCount + " 人收藏，无法删除");
        }

        articleMapper.deleteById(id);
    }

    @Override
    public IPage<ArticleVO> search(String keyword, Integer pageNum, Integer pageSize) {
        return articleSearchService.search(keyword, pageNum, pageSize);
    }

    @Override
    public List<Article> searchByTitle(String title) {
        return articleMapper.selectList(
                new LambdaQueryWrapper<Article>()
                        .like(StringUtils.hasText(title), Article::getTitle, title)
                        .eq(Article::getStatus, 2)
                        .orderByDesc(Article::getCreateTime)
                        .last("LIMIT 20"));
    }

    private void saveImages(Long articleId, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) return;
        for (int i = 0; i < imageUrls.size(); i++) {
            ArticleImage img = new ArticleImage();
            img.setArticleId(articleId);
            img.setImageUrl(imageUrls.get(i));
            img.setSort(i);
            articleImageMapper.insert(img);
        }
    }

    private void saveVideos(Long articleId, List<VideoDTO> videos) {
        if (videos == null || videos.isEmpty()) return;
        for (int i = 0; i < videos.size(); i++) {
            VideoDTO v = videos.get(i);
            ArticleVideo video = new ArticleVideo();
            video.setArticleId(articleId);
            video.setVideoUrl(v.getVideoUrl());
            video.setCoverUrl(v.getCoverUrl());
            video.setDuration(v.getDuration());
            video.setSort(v.getSort() != null ? v.getSort() : i);
            articleVideoMapper.insert(video);
        }
    }

    /**
     * 从文章内容中提取摘要
     * 如果内容包含"摘要："或"摘要:"标记，提取该标记后的内容
     * 否则提取正文前200字（去除标题、图片、代码等标记）
     */
    private String extractSummary(String content, String title) {
        if (content == null || content.isEmpty()) return "";

        // 检查是否包含AI生成的摘要标记
        String[] markers = {"摘要：", "摘要:"};
        for (String marker : markers) {
            int idx = content.indexOf(marker);
            if (idx >= 0) {
                String summary = content.substring(idx + marker.length()).trim();
                // 取摘要的第一段，最多200字
                int lineEnd = summary.indexOf('\n');
                if (lineEnd > 0) summary = summary.substring(0, lineEnd);
                return summary.length() > 200 ? summary.substring(0, 200) + "..." : summary;
            }
        }

        // 没有摘要标记，提取正文前200字
        String plainText = content;
        // 去除Markdown/HTML标记
        plainText = plainText.replaceAll("#{1,6}\\s+", ""); // 标题
        plainText = plainText.replaceAll("!\\[.*?\\]\\(.*?\\)", ""); // 图片
        plainText = plainText.replaceAll("\\[.*?\\]\\(.*?\\)", ""); // 链接
        plainText = plainText.replaceAll("`{1,3}[^`]*`{1,3}", ""); // 代码
        plainText = plainText.replaceAll("<[^>]+>", ""); // HTML标签
        plainText = plainText.replaceAll("\\*{1,2}([^*]+)\\*{1,2}", "$1"); // 加粗/斜体
        plainText = plainText.replaceAll(">\\s*", ""); // 引用
        plainText = plainText.replaceAll("-{3,}", ""); // 分割线
        plainText = plainText.replaceAll("\\n{2,}", "\n"); // 多个换行
        plainText = plainText.trim();

        // 去掉标题行（如果第一行是标题）
        if (title != null && plainText.startsWith(title)) {
            plainText = plainText.substring(title.length()).trim();
        }

        // 提取前200字
        if (plainText.length() > 200) {
            return plainText.substring(0, 200) + "...";
        }
        return plainText;
    }

    private ArticleDetailVO toDetailVO(Article article, boolean checkFavorite) {
        ArticleDetailVO vo = new ArticleDetailVO();
        vo.setId(article.getId());
        vo.setTitle(article.getTitle());
        vo.setSummary(article.getSummary());
        // 如果没有封面图，使用默认封面
        vo.setCoverImage(StringUtils.hasText(article.getCoverImage()) ? article.getCoverImage() : DEFAULT_COVER_IMAGE);
        vo.setStatus(article.getStatus());
        vo.setViewCount(article.getViewCount());
        vo.setLikeCount(article.getLikeCount());
        vo.setFavoriteCount(article.getFavoriteCount());
        vo.setCommentCount(article.getCommentCount());
        vo.setIsTop(article.getIsTop());
        vo.setCreateTime(article.getCreateTime());
        vo.setContent(article.getContent());
        vo.setContentFormat(article.getContentFormat());
        vo.setSource(article.getSource());
        vo.setSourceUrl(article.getSourceUrl());
        vo.setTags(article.getTags());

        // 文章图片
        List<ArticleImage> images = articleImageMapper.selectList(
                new LambdaQueryWrapper<ArticleImage>()
                        .eq(ArticleImage::getArticleId, article.getId())
                        .orderByAsc(ArticleImage::getSort));
        vo.setImages(images);

        // 文章视频
        List<ArticleVideo> videos = articleVideoMapper.selectList(
                new LambdaQueryWrapper<ArticleVideo>()
                        .eq(ArticleVideo::getArticleId, article.getId())
                        .orderByAsc(ArticleVideo::getSort));
        vo.setVideos(videos);

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
