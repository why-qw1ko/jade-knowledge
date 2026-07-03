package com.jade.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("crawl_task")
public class CrawlTask {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String url;
    private String type;
    private String scheduleCron;
    /** 0-待执行 1-执行中 2-已完成 3-失败 */
    private Integer status;
    private LocalDateTime lastRunTime;
    private Integer runCount;
    @TableLogic
    private Integer deleted;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
