package com.jade.model.dto;

import lombok.Data;

/** 评论DTO */
@Data
public class CommentDTO {
    private Long articleId;
    private String content;
    private Long parentId;
    private Long replyUserId;
}
