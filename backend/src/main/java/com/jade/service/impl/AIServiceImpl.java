package com.jade.service.impl;

import com.jade.ai.LlmClient;
import com.jade.service.AIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * AI服务实现 — 调用大模型进行内容清洗和摘要生成
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    private final LlmClient llmClient;

    private static final String CLEAN_SYSTEM_PROMPT =
            "你是一个玉石知识内容编辑。请对以下原始内容进行清洗：\n" +
            "1. 去除广告、无关链接、重复内容\n" +
            "2. 保留核心玉石知识信息\n" +
            "3. 重新组织为清晰的文章格式（标题、段落）\n" +
            "4. 使用 Markdown 格式输出\n" +
            "5. 如果内容与玉石无关，返回空字符串";

    private static final String SUMMARY_SYSTEM_PROMPT =
            "你是一个玉石知识内容编辑。请为以下文章生成一段简洁的中文摘要，100-200字，突出核心知识点。";

    private static final String TAG_SYSTEM_PROMPT =
            "你是一个玉石知识内容编辑。请从以下内容中提取3-5个标签关键词，用逗号分隔返回。" +
            "只返回标签，不要其他内容。示例格式：翡翠,鉴别,收藏,冰种";

    private static final String GENERATE_ARTICLE_PROMPT =
            "你是一个专业的玉石知识内容创作者。请根据用户的提示词或问句，生成一篇完整的玉石知识文章。\n" +
            "要求：\n" +
            "1. 使用 Markdown 格式输出\n" +
            "2. 包含合适的标题（一级标题）\n" +
            "3. 内容结构清晰，有段落、小标题\n" +
            "4. 内容专业准确，适合玉石知识平台\n" +
            "5. 文章长度 800-2000 字\n" +
            "6. 每个段落开头加上两个全角空格（即「　　」）实现首行缩进\n" +
            "7. 在文章末尾另起一行，以「摘要：」开头写一段 100-200 字的摘要";

    @Override
    public String cleanContent(String rawContent) {
        log.info("AI内容清洗，原始长度: {}", rawContent.length());

        String result = llmClient.chat(CLEAN_SYSTEM_PROMPT, rawContent);
        if (result != null && !result.isEmpty()) {
            return result;
        }

        // Fallback: 简单清洗
        log.warn("LLM 调用失败，使用 fallback 清洗");
        return "# 玉石知识\n\n" + rawContent.trim();
    }

    @Override
    public String generateSummary(String content) {
        if (content == null) return "";

        String result = llmClient.chat(SUMMARY_SYSTEM_PROMPT, content);
        if (result != null && !result.isEmpty()) {
            return result.length() > 300 ? result.substring(0, 300) : result;
        }

        // Fallback: 截断
        log.warn("LLM 摘要生成失败，使用 fallback");
        return content.length() > 200 ? content.substring(0, 200) + "..." : content;
    }

    @Override
    public String generateArticle(String prompt) {
        log.info("AI生成文章，提示词: {}", prompt);
        String result = llmClient.chat(GENERATE_ARTICLE_PROMPT, prompt);
        if (result != null && !result.isEmpty()) {
            return result;
        }
        log.warn("LLM 文章生成失败");
        return null;
    }

    @Override
    public void streamGenerateArticle(String prompt, Consumer<String> onChunk) {
        log.info("AI流式生成文章，提示词: {}", prompt);
        llmClient.streamChat(GENERATE_ARTICLE_PROMPT, prompt, onChunk);
    }

    /**
     * 生成标签（从内容中提取关键词）
     */
    public List<String> generateTags(String content) {
        if (content == null || content.isEmpty()) return new ArrayList<>();

        String result = llmClient.chat(TAG_SYSTEM_PROMPT, content);
        if (result != null && !result.isEmpty()) {
            List<String> tags = new ArrayList<>();
            for (String tag : result.split("[,，、]")) {
                String trimmed = tag.trim();
                if (!trimmed.isEmpty()) {
                    tags.add(trimmed);
                }
            }
            if (!tags.isEmpty()) return tags;
        }

        // Fallback: 关键词匹配
        List<String> tags = new ArrayList<>();
        if (content.contains("翡翠")) tags.add("翡翠");
        if (content.contains("和田玉")) tags.add("和田玉");
        if (content.contains("碧玺")) tags.add("碧玺");
        if (content.contains("鉴别")) tags.add("鉴别");
        if (content.contains("收藏")) tags.add("收藏");
        return tags;
    }
}
