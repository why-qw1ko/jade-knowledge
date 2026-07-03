package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jade.common.BusinessException;
import com.jade.mapper.*;
import com.jade.model.entity.*;
import com.jade.service.AIService;
import com.jade.service.CrawlService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CrawlServiceImpl implements CrawlService {

    private final CrawlTaskMapper crawlTaskMapper;
    private final CrawlResultMapper crawlResultMapper;
    private final ArticleMapper articleMapper;
    private final AIService aiService;

    @Override
    @Transactional
    public void triggerCrawl(String keyword) {
        CrawlTask task = new CrawlTask();
        task.setName("抓取-" + keyword);
        task.setUrl("https://www.baidu.com/s?wd=" + keyword);
        task.setType("AI");
        task.setStatus(1);
        task.setRunCount(0);
        crawlTaskMapper.insert(task);

        try {
            // 模拟搜索结果（实际应调用搜索引擎API）
            String mockContent = "关于「" + keyword + "」的玉石知识内容。翡翠是玉的一种，也称翡翠玉、翠玉、硬玉、缅甸玉。"
                    + "翡翠是在地质作用下形成的达到玉级的石质多晶集合体。";

            String cleanContent = aiService.cleanContent(mockContent);

            CrawlResult result = new CrawlResult();
            result.setTaskId(task.getId());
            result.setTitle(keyword + "相关知识");
            result.setContent(mockContent);
            result.setCleanContent(cleanContent);
            result.setSourceUrl(task.getUrl());
            result.setSource("百度搜索");
            result.setStatus(0);
            crawlResultMapper.insert(result);

            task.setStatus(2);
            task.setRunCount(1);
            task.setLastRunTime(LocalDateTime.now());
        } catch (Exception e) {
            task.setStatus(3);
        }
        crawlTaskMapper.updateById(task);
    }

    @Override
    public IPage<CrawlResult> listResults(Integer pageNum, Integer pageSize, Integer status) {
        LambdaQueryWrapper<CrawlResult> wrapper = new LambdaQueryWrapper<>();
        if (status != null) wrapper.eq(CrawlResult::getStatus, status);
        wrapper.orderByDesc(CrawlResult::getCreateTime);
        return crawlResultMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void approveResult(Long id, Long auditorId) {
        CrawlResult result = crawlResultMapper.selectById(id);
        if (result == null) throw new BusinessException("抓取结果不存在");
        result.setStatus(1);
        result.setAuditUserId(auditorId);
        crawlResultMapper.updateById(result);
    }

    @Override
    public void rejectResult(Long id, Long auditorId, String remark) {
        CrawlResult result = crawlResultMapper.selectById(id);
        if (result == null) throw new BusinessException("抓取结果不存在");
        result.setStatus(2);
        result.setAuditUserId(auditorId);
        result.setAuditRemark(remark);
        crawlResultMapper.updateById(result);
    }

    @Override
    @Transactional
    public Long publishResult(Long id, Long auditorId) {
        CrawlResult result = crawlResultMapper.selectById(id);
        if (result == null) throw new BusinessException("抓取结果不存在");

        Article article = new Article();
        article.setTitle(result.getTitle());
        article.setContent(result.getCleanContent());
        article.setSource(result.getSource());
        article.setSourceUrl(result.getSourceUrl());
        article.setAuthorId(auditorId);
        article.setStatus(2); // 直接发布
        article.setViewCount(0L);
        article.setLikeCount(0L);
        article.setFavoriteCount(0L);
        article.setCommentCount(0L);
        articleMapper.insert(article);

        result.setStatus(3);
        result.setArticleId(article.getId());
        crawlResultMapper.updateById(result);

        return article.getId();
    }

    @Override
    public IPage<CrawlTask> listTasks(Integer pageNum, Integer pageSize) {
        return crawlTaskMapper.selectPage(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<CrawlTask>().orderByDesc(CrawlTask::getCreateTime));
    }
}
