package com.jade.model.vo;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/** 评论视图对象 */
@Data
public class CommentVO {
    private Long id;
    private String content;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Long parentId;
    private Long replyUserId;
    private String replyUserName;
    private Integer status;
    private LocalDateTime createTime;
    private List<CommentVO> children;
}
