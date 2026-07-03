package com.jade.service.impl;

import com.jade.service.AIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * AI服务实现 - 实际项目中对接大模型API
 * 当前为模拟实现，可扩展对接 OpenAI/通义千问/DeepSeek
 */
@Slf4j
@Service
public class AIServiceImpl implements AIService {

    @Override
    public String cleanContent(String rawContent) {
        // TODO: 对接大模型API进行内容清洗
        // 实际实现中应调用 Spring AI 或直接 HTTP 调用大模型
        log.info("AI内容清洗，原始长度: {}", rawContent.length());
        return "# 玉石知识\n\n" + rawContent.trim();
    }

    @Override
    public String generateSummary(String content) {
        // TODO: 调用大模型生成摘要
        if (content == null) return "";
        return content.length() > 200 ? content.substring(0, 200) + "..." : content;
    }

    /** 生成标签 */
    public List<String> generateTags(String content) {
        List<String> tags = new ArrayList<>();
        if (content != null) {
            if (content.contains("翡翠")) tags.add("翡翠");
            if (content.contains("和田玉")) tags.add("和田玉");
            if (content.contains("碧玺")) tags.add("碧玺");
            if (content.contains("鉴别")) tags.add("鉴别");
            if (content.contains("收藏")) tags.add("收藏");
        }
        return tags;
    }
}
