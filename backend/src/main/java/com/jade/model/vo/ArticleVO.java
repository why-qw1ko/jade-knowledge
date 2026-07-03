package com.jade.model.vo;

import lombok.Data;
import java.time.LocalDateTime;

/** 文章列表视图对象 */
@Data
public class ArticleVO {
    private Long id;
    private String title;
    private String summary;
    private String coverImage;
    private String categoryName;
    private String authorName;
    private Integer status;
    private Long viewCount;
    private Long likeCount;
    private Long favoriteCount;
    private Long commentCount;
    private Integer isTop;
    private LocalDateTime createTime;
}
