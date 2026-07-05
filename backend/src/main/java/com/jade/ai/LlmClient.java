package com.jade.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jade.service.SystemConfigService;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

/**
 * 通用 LLM 客户端 — 同时兼容 OpenAI 和 Anthropic 协议
 *
 * 自动根据 API URL 判断使用哪种协议：
 *   - URL 包含 /anthropic/ 或 /messages → Anthropic 协议
 *   - 其他 → OpenAI 协议（默认）
 *
 * 支持的服务商（OpenAI 协议）：
 * ┌──────────────────┬──────────────────────────────────────────────────────────────┬─────────────────────────┐
 * │ 服务商            │ api-url                                                       │ 常用 model              │
 * ├──────────────────┼──────────────────────────────────────────────────────────────┼─────────────────────────┤
 * │ DeepSeek         │ https://api.deepseek.com/v1/chat/completions                 │ deepseek-chat           │
 * │ 通义千问 (阿里)    │ https://dashscope.aliyuncs.com/compatible-mode/v1/...        │ qwen-plus / qwen-max    │
 * │ 智谱 GLM          │ https://open.bigmodel.cn/api/paas/v4/chat/completions       │ glm-4-flash / glm-4     │
 * │ 豆包 (字节跳动)    │ https://ark.cn-beijing.volces.com/api/v3/chat/completions   │ doubao-pro-32k          │
 * │ Kimi (月之暗面)   │ https://api.moonshot.cn/v1/chat/completions                  │ moonshot-v1-8k          │
 * │ OpenAI            │ https://api.openai.com/v1/chat/completions                   │ gpt-4o / gpt-4o-mini    │
 * │ 小米 MiMo         │ https://api.xiaomimimo.com/v1/chat/completions               │ MiMo-v2.5-Pro           │
 * └──────────────────┴──────────────────────────────────────────────────────────────┴─────────────────────────┘
 *
 * 支持的服务商（Anthropic 协议）：
 * ┌──────────────────┬──────────────────────────────────────────────────────────────┬─────────────────────────┐
 * │ 小米 MiMo         │ https://api.xiaomimimo.com/anthropic/v1/messages             │ MiMo-v2.5-Pro           │
 * │ Anthropic Claude  │ https://api.anthropic.com/v1/messages                        │ claude-sonnet-4-20250514│
 * └──────────────────┴──────────────────────────────────────────────────────────────┴─────────────────────────┘
 *
 * 配置方式：后台「系统配置」页面选择服务商并填入 API Key 即可。
 */
@Slf4j
@Component
public class LlmClient {

    private final RestTemplate restTemplate;

    @Autowired
    private SystemConfigService systemConfigService;

    // YAML 配置作为兜底默认值
    @Value("${ai.api-url:https://api.deepseek.com/v1/chat/completions}")
    private String defaultApiUrl;

    @Value("${ai.api-key:}")
    private String defaultApiKey;

    @Value("${ai.model:deepseek-chat}")
    private String defaultModel;

    public LlmClient() {
        this.restTemplate = new RestTemplate();
        // 强制使用 UTF-8 编码，避免中文乱码
        this.restTemplate.getMessageConverters().removeIf(converter -> converter instanceof StringHttpMessageConverter);
        this.restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
    }

    /**
     * 调用大模型对话
     * 优先从数据库读取配置（后台设置页面保存），兜底使用 YAML 配置
     * 自动判断使用 OpenAI 协议还是 Anthropic 协议
     */
    public String chat(String systemPrompt, String userMessage) {
        String apiUrl = getConfig("ai_api_url", defaultApiUrl);
        String apiKey = getConfig("ai_api_key", defaultApiKey);
        String model = getConfig("ai_model", defaultModel);

        if (apiKey == null || apiKey.isEmpty()
                || apiKey.equals("your-api-key-here")
                || apiKey.equals("your-siliconflow-api-key")) {
            log.warn("AI API Key 未配置，跳过 LLM 调用");
            return null;
        }

        boolean anthropic = apiUrl.contains("/anthropic/") || apiUrl.endsWith("/messages");
        log.info("调用 LLM: url={}, model={}, protocol={}", apiUrl, model, anthropic ? "Anthropic" : "OpenAI");

        try {
            return anthropic
                    ? callAnthropic(apiUrl, apiKey, model, systemPrompt, userMessage)
                    : callOpenAI(apiUrl, apiKey, model, systemPrompt, userMessage);
        } catch (Exception e) {
            log.error("LLM 调用失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 流式调用大模型（SSE），每个 chunk 通过 onChunk 回调返回
     */
    public void streamChat(String systemPrompt, String userMessage, Consumer<String> onChunk) {
        String apiUrl = getConfig("ai_api_url", defaultApiUrl);
        String apiKey = getConfig("ai_api_key", defaultApiKey);
        String model = getConfig("ai_model", defaultModel);

        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your-api-key-here")) {
            throw new RuntimeException("AI API Key 未配置");
        }

        boolean anthropic = apiUrl.contains("/anthropic/") || apiUrl.endsWith("/messages");
        log.info("流式调用 LLM: url={}, model={}, protocol={}", apiUrl, model, anthropic ? "Anthropic" : "OpenAI");

        if (anthropic) {
            streamAnthropic(apiUrl, apiKey, model, systemPrompt, userMessage, onChunk);
        } else {
            streamOpenAI(apiUrl, apiKey, model, systemPrompt, userMessage, onChunk);
        }
    }

    /** OpenAI 协议流式调用 */
    private void streamOpenAI(String url, String apiKey, String model,
                              String systemPrompt, String userMessage, Consumer<String> onChunk) {
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setDoOutput(true);
            conn.setConnectTimeout(30000);
            conn.setReadTimeout(300000);

            String body = String.format(
                    "{\"model\":\"%s\",\"messages\":[{\"role\":\"system\",\"content\":\"%s\"},{\"role\":\"user\",\"content\":\"%s\"}],\"stream\":true,\"max_tokens\":4000}",
                    model, escapeJson(systemPrompt), escapeJson(userMessage));
            conn.getOutputStream().write(body.getBytes(StandardCharsets.UTF_8));

            if (conn.getResponseCode() != 200) {
                log.error("LLM stream HTTP error: {}", conn.getResponseCode());
                throw new RuntimeException("LLM 调用失败: HTTP " + conn.getResponseCode());
            }

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.startsWith("data: ")) continue;
                    String data = line.substring(6).trim();
                    if ("[DONE]".equals(data)) break;
                    try {
                        com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(data);
                        com.fasterxml.jackson.databind.JsonNode delta = node.at("/choices/0/delta/content");
                        if (!delta.isMissingNode() && !delta.isNull() && !delta.asText().isEmpty()) {
                            String text = delta.asText().replace("\0", "");
                            if (!text.isEmpty()) onChunk.accept(text);
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("LLM stream 失败: {}", e.getMessage());
            throw new RuntimeException("LLM 流式调用失败", e);
        }
    }

    /** Anthropic 协议流式调用 */
    private void streamAnthropic(String url, String apiKey, String model,
                                 String systemPrompt, String userMessage, Consumer<String> onChunk) {
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setRequestProperty("x-api-key", apiKey);
            conn.setRequestProperty("anthropic-version", "2023-06-01");
            conn.setDoOutput(true);
            conn.setConnectTimeout(30000);
            conn.setReadTimeout(300000);

            String body = String.format(
                    "{\"model\":\"%s\",\"max_tokens\":4000,\"stream\":true,\"system\":\"%s\",\"messages\":[{\"role\":\"user\",\"content\":\"%s\"}]}",
                    model, escapeJson(systemPrompt), escapeJson(userMessage));
            conn.getOutputStream().write(body.getBytes(StandardCharsets.UTF_8));

            if (conn.getResponseCode() != 200) {
                throw new RuntimeException("LLM 调用失败: HTTP " + conn.getResponseCode());
            }

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.startsWith("data: ")) continue;
                    String data = line.substring(6).trim();
                    try {
                        com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(data);
                        String type = node.has("type") ? node.get("type").asText() : "";
                        if ("content_block_delta".equals(type)) {
                            com.fasterxml.jackson.databind.JsonNode text = node.at("/delta/text");
                            if (!text.isMissingNode() && !text.isNull() && !text.asText().isEmpty()) {
                                String t = text.asText().replace("\0", "");
                                if (!t.isEmpty()) onChunk.accept(t);
                            }
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Anthropic stream 失败: {}", e.getMessage());
            throw new RuntimeException("LLM 流式调用失败", e);
        }
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
    }

    /** OpenAI 协议: POST /v1/chat/completions */
    private String callOpenAI(String url, String apiKey, String model,
                              String systemPrompt, String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)
                ),
                "temperature", 0.3,
                "max_tokens", 2000
        );

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
        ResponseEntity<OpenAIResponse> resp = restTemplate.exchange(url, HttpMethod.POST, req, OpenAIResponse.class);

        if (resp.getBody() != null && resp.getBody().getChoices() != null
                && !resp.getBody().getChoices().isEmpty()) {
            return resp.getBody().getChoices().get(0).getMessage().getContent();
        }
        return null;
    }

    /** Anthropic 协议: POST /v1/messages */
    private String callAnthropic(String url, String apiKey, String model,
                                 String systemPrompt, String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("max_tokens", 2000);
        body.put("system", systemPrompt);
        body.put("messages", List.of(Map.of("role", "user", "content", userMessage)));

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
        ResponseEntity<AnthropicResponse> resp = restTemplate.exchange(url, HttpMethod.POST, req, AnthropicResponse.class);

        if (resp.getBody() != null && resp.getBody().getContent() != null
                && !resp.getBody().getContent().isEmpty()) {
            return resp.getBody().getContent().get(0).getText();
        }
        return null;
    }

    private String getConfig(String key, String fallback) {
        try {
            String val = systemConfigService.getConfig(key);
            return (val != null && !val.isEmpty()) ? val : fallback;
        } catch (Exception e) {
            return fallback;
        }
    }

    // ---- OpenAI 响应结构 ----
    @Data
    public static class OpenAIResponse {
        private List<OpenAIChoice> choices;
    }
    @Data
    public static class OpenAIChoice {
        private OpenAIMessage message;
    }
    @Data
    public static class OpenAIMessage {
        private String role;
        private String content;
    }

    // ---- Anthropic 响应结构 ----
    @Data
    public static class AnthropicResponse {
        private List<AnthropicContent> content;
    }
    @Data
    public static class AnthropicContent {
        private String type;
        private String text;
    }
}
