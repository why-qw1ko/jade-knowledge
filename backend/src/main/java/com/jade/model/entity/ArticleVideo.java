package com.jade.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("article_video")
public class ArticleVideo {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long articleId;
    private String videoUrl;
    private String coverUrl;
    private Integer duration;
    private Integer sort;
    @TableLogic
    private Integer deleted;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
