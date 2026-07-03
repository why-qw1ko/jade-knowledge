package com.jade.model.dto;

import lombok.Data;

/** 文章DTO */
@Data
public class ArticleDTO {
    private String title;
    private String content;
    private String summary;
    private String coverImage;
    private Long categoryId;
    private String tags;
    private String source;
    private String sourceUrl;
    private Integer isTop;
    private Integer status;
}
