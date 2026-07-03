package com.jade.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.model.entity.CrawlResult;
import com.jade.model.entity.CrawlTask;

public interface CrawlService {
    void triggerCrawl(String keyword);
    IPage<CrawlResult> listResults(Integer pageNum, Integer pageSize, Integer status);
    void approveResult(Long id, Long auditorId);
    void rejectResult(Long id, Long auditorId, String remark);
    Long publishResult(Long id, Long auditorId);
    IPage<CrawlTask> listTasks(Integer pageNum, Integer pageSize);
}
