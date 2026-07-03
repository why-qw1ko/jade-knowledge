package com.jade.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("article")
public class Article {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String content;
    private String summary;
    private String coverImage;
    private Long categoryId;
    private Long authorId;
    /** 0-草稿 1-待审核 2-已发布 3-已下线 */
    private Integer status;
    private Long viewCount;
    private Long likeCount;
    private Long favoriteCount;
    private Long commentCount;
    private String source;
    private String sourceUrl;
    private Integer isTop;
    @TableLogic
    private Integer deleted;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
