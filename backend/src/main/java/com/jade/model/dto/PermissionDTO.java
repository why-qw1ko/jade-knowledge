package com.jade.model.dto;

import lombok.Data;

/** 权限DTO */
@Data
public class PermissionDTO {
    private String name;
    private String code;
    private Integer type;
    private Long parentId;
    private String path;
    private String icon;
    private Integer sort;
}
