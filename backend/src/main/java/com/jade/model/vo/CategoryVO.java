package com.jade.model.vo;

import lombok.Data;
import java.util.List;

/** 分类视图对象（树形） */
@Data
public class CategoryVO {
    private Long id;
    private String name;
    private Long parentId;
    private Integer level;
    private Integer sort;
    private String icon;
    private String description;
    private List<CategoryVO> children;
}
