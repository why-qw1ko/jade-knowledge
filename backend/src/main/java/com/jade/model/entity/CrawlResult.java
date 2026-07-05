package com.jade.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("crawl_result")
public class CrawlResult {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long taskId;
    private String title;
    private String content;
    private String cleanContent;
    private String sourceUrl;
    private String source;
    /** 0-待审核 1-已通过 2-已拒绝 3-已发布 */
    private Integer status;
    private Long auditUserId;
    private String auditRemark;
    private Long articleId;
    @TableLogic
    private Integer deleted;
    @TableField(fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
}
