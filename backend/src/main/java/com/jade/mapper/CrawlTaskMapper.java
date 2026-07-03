package com.jade.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jade.model.entity.CrawlTask;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CrawlTaskMapper extends BaseMapper<CrawlTask> {
}
