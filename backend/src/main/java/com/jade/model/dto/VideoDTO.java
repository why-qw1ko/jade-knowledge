package com.jade.model.dto;

import lombok.Data;

/** 视频DTO */
@Data
public class VideoDTO {
    private String videoUrl;
    private String coverUrl;
    private Integer duration;
    private Integer sort;
}
