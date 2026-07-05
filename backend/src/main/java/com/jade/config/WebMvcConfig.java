package com.jade.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC配置 — 静态资源映射
 *
 * 将上传目录映射为HTTP静态资源路径，使前端可以通过URL直接访问上传的文件。
 * 例如：upload.path=/data/uploads, url-prefix=/uploads
 *   → 请求 /uploads/images/abc.jpg 实际读取 /data/uploads/images/abc.jpg
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${upload.path:/data/uploads}")
    private String uploadPath;

    @Value("${upload.url-prefix:/uploads}")
    private String urlPrefix;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 将 Windows 反斜杠转为正斜杠，并确保以 / 结尾
        String normalizedPath = uploadPath.replace("\\", "/");
        if (!normalizedPath.endsWith("/")) {
            normalizedPath = normalizedPath + "/";
        }
        String resourceLocation = "file:///" + normalizedPath;

        // urlPattern: /uploads/**  （Ant风格，匹配子路径）
        String urlPattern = urlPrefix.endsWith("/")
                ? urlPrefix + "**"
                : urlPrefix + "/**";

        registry.addResourceHandler(urlPattern)
                .addResourceLocations(resourceLocation);
    }
}
