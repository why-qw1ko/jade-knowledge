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
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;

@Slf4j
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
        task.setUrl("https://www.baidu.com/s?wd=" + URLEncoder.encode(keyword, StandardCharsets.UTF_8));
        task.setType("AI");
        task.setStatus(1);
        task.setRunCount(0);
        crawlTaskMapper.insert(task);

        try {
            // 1. 搜索百度获取相关链接
            List<SearchResult> searchResults = searchBaidu(keyword);
            log.info("搜索到 {} 条结果", searchResults.size());

            if (searchResults.isEmpty()) {
                task.setStatus(3);
                crawlTaskMapper.updateById(task);
                return;
            }

            // 2. 抓取前3条结果的正文
            StringJoiner contentJoiner = new StringJoiner("\n\n---\n\n");
            String sourceUrl = searchResults.get(0).url;
            String source = searchResults.get(0).title;

            for (int i = 0; i < Math.min(3, searchResults.size()); i++) {
                try {
                    String pageContent = fetchPageContent(searchResults.get(i).url);
                    if (pageContent != null && !pageContent.isEmpty()) {
                        contentJoiner.add("【来源: " + searchResults.get(i).title + "】\n" + pageContent);
                    }
                } catch (Exception e) {
                    log.warn("抓取页面失败: {}", searchResults.get(i).url, e);
                }
            }

            String rawContent = contentJoiner.toString();
            if (rawContent.isEmpty()) {
                task.setStatus(3);
                crawlTaskMapper.updateById(task);
                return;
            }

            // 3. AI 清洗内容
            String cleanContent = aiService.cleanContent(rawContent);

            // 4. 保存结果
            CrawlResult result = new CrawlResult();
            result.setTaskId(task.getId());
            result.setTitle(keyword + "相关知识");
            result.setContent(rawContent.length() > 5000 ? rawContent.substring(0, 5000) : rawContent);
            result.setCleanContent(cleanContent);
            result.setSourceUrl(sourceUrl);
            result.setSource(source);
            result.setStatus(0);
            crawlResultMapper.insert(result);

            task.setStatus(2);
            task.setRunCount(1);
            task.setLastRunTime(LocalDateTime.now());
        } catch (Exception e) {
            log.error("抓取任务失败: {}", keyword, e);
            task.setStatus(3);
        }
        crawlTaskMapper.updateById(task);
    }

    @Override
    @Transactional
    public Long generateArticle(String prompt, Long userId) {
        // 1. AI 生成文章内容
        String generated = aiService.generateArticle(prompt);
        if (generated == null || generated.isEmpty()) {
            throw new BusinessException("AI生成失败，请稍后重试");
        }

        // 2. 从生成内容中提取标题（第一个 # 开头的行）
        String title = prompt;
        String summary = "";
        String content = generated;
        String[] lines = generated.split("\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("# ") && title.equals(prompt)) {
                title = trimmed.substring(2).trim();
            }
            if (trimmed.startsWith("摘要：") || trimmed.startsWith("摘要:")) {
                summary = trimmed.substring(trimmed.indexOf("：") + 1).trim();
                // 从content中移除摘要行
                content = generated.substring(0, generated.indexOf(trimmed)).trim();
            }
        }

        // 3. 创建爬取结果记录（走审核流程）
        CrawlTask task = new CrawlTask();
        task.setName("AI生成-" + prompt);
        task.setUrl("ai://generate");
        task.setType("AI_GENERATE");
        task.setStatus(2); // 直接完成
        task.setRunCount(1);
        task.setLastRunTime(LocalDateTime.now());
        crawlTaskMapper.insert(task);

        CrawlResult result = new CrawlResult();
        result.setTaskId(task.getId());
        result.setTitle(title);
        result.setContent(prompt);
        result.setCleanContent(content);
        result.setSource("AI生成");
        result.setSourceUrl("");
        result.setStatus(0); // 待审核
        crawlResultMapper.insert(result);

        return result.getId();
    }

    @Override
    @Transactional
    public Long saveGeneratedArticle(String prompt, String title, String content, String summary, Long userId) {
        CrawlTask task = new CrawlTask();
        task.setName("AI生成-" + prompt);
        task.setUrl("ai://generate");
        task.setType("AI_GENERATE");
        task.setStatus(2);
        task.setRunCount(1);
        task.setLastRunTime(LocalDateTime.now());
        crawlTaskMapper.insert(task);

        CrawlResult result = new CrawlResult();
        result.setTaskId(task.getId());
        result.setTitle(title);
        result.setContent(prompt);
        result.setCleanContent(content);
        result.setSource("AI生成");
        result.setSourceUrl("");
        result.setStatus(0);
        crawlResultMapper.insert(result);

        return result.getId();
    }

    /**
     * 百度搜索，提取搜索结果链接
     */
    private List<SearchResult> searchBaidu(String keyword) {
        List<SearchResult> results = new ArrayList<>();
        try {
            String url = "https://www.baidu.com/s?wd=" + URLEncoder.encode(keyword + " 玉石知识", StandardCharsets.UTF_8);
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(10000)
                    .get();

            // 提取搜索结果
            Elements items = doc.select("div.result, div.c-container");
            for (Element item : items) {
                Element titleEl = item.selectFirst("h3 a, .c-title a");
                if (titleEl != null) {
                    String title = titleEl.text();
                    String link = titleEl.attr("href");
                    if (title != null && !title.isEmpty() && link != null && !link.isEmpty()) {
                        results.add(new SearchResult(title, link));
                    }
                }
                if (results.size() >= 5) break;
            }
        } catch (Exception e) {
            log.error("百度搜索失败: {}", keyword, e);
        }
        return results;
    }

    /**
     * 抓取页面正文内容
     */
    private String fetchPageContent(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(15000)
                    .get();

            // 移除无关元素
            doc.select("script, style, nav, header, footer, aside, .ad, .sidebar, .comment").remove();

            // 尝试提取正文区域
            Element content = doc.selectFirst("article, .article, .content, .post-content, .entry-content, #content, main");
            if (content == null) {
                content = doc.body();
            }

            String text = content.text();
            // 限制长度
            if (text.length() > 3000) {
                text = text.substring(0, 3000);
            }
            return text;
        } catch (Exception e) {
            log.warn("抓取页面内容失败: {}", url, e);
            return null;
        }
    }

    private static class SearchResult {
        String title;
        String url;

        SearchResult(String title, String url) {
            this.title = title;
            this.url = url;
        }
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
        article.setContentFormat("markdown");
        article.setSource(result.getSource());
        article.setSourceUrl(result.getSourceUrl());
        article.setAuthorId(auditorId);
        article.setStatus(0); // 创建为草稿，等待编辑后手动发布
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

    @Override
    public void deleteTask(Long id) {
        crawlTaskMapper.deleteById(id);
    }
}
