package com.jade.model.dto;

import lombok.Data;

/** 分类DTO */
@Data
public class CategoryDTO {
    private String name;
    private Long parentId;
    private Integer level;
    private Integer sort;
    private String icon;
    private String description;
}
