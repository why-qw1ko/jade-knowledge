package com.jade.service;

import java.util.function.Consumer;

public interface AIService {
    String cleanContent(String rawContent);
    String generateSummary(String content);
    String generateArticle(String prompt);
    void streamGenerateArticle(String prompt, Consumer<String> onChunk);
}
