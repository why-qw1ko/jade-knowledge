package com.jade.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("article_image")
public class ArticleImage {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long articleId;
    private String imageUrl;
    private Integer sort;
    @TableLogic
    private Integer deleted;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
