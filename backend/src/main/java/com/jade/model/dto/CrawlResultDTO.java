package com.jade.model.dto;

import lombok.Data;

/** 抓取结果审核DTO */
@Data
public class CrawlResultDTO {
    private Long id;
    private Integer status;
    private String auditRemark;
}
