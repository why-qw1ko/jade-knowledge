package com.jade.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("permission")
public class Permission {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String code;
    private Integer type;
    private Long parentId;
    private String path;
    private String icon;
    private Integer sort;
    @TableLogic
    private Integer deleted;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
