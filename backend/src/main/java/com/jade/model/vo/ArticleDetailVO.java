package com.jade.model.vo;

import com.jade.model.entity.ArticleImage;
import com.jade.model.entity.ArticleVideo;
import lombok.Data;
import java.util.List;

/** 文章详情视图对象 */
@Data
public class ArticleDetailVO extends ArticleVO {
    private String content;
    private String tags;
    private String source;
    private String sourceUrl;
    private Boolean isFavorited;
    private List<ArticleImage> images;
    private List<ArticleVideo> videos;
}
