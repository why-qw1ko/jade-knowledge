package com.jade.controller;

import com.jade.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Tag(name = "文件上传")
@RestController
@RequestMapping("/api/admin/upload")
@RequiredArgsConstructor
public class UploadController {

    @Value("${upload.path:/data/uploads}")
    private String uploadPath;

    @Value("${upload.url-prefix:/uploads}")
    private String urlPrefix;

    @Operation(summary = "上传图片")
    @PostMapping("/image")
    public Result<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        return upload(file, new String[]{"jpg", "jpeg", "png", "gif", "webp", "svg"});
    }

    @Operation(summary = "上传视频")
    @PostMapping("/video")
    public Result<Map<String, String>> uploadVideo(@RequestParam("file") MultipartFile file) {
        return upload(file, new String[]{"mp4", "webm", "ogg", "avi", "mov"});
    }

    private Result<Map<String, String>> upload(MultipartFile file, String[] allowedExts) {
        if (file.isEmpty()) {
            return Result.error(400, "请选择文件");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            return Result.error(400, "文件名为空");
        }

        String ext = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf(".") + 1).toLowerCase()
                : "";
        boolean allowed = false;
        for (String e : allowedExts) {
            if (e.equals(ext)) { allowed = true; break; }
        }
        if (!allowed) {
            return Result.error(400, "不支持的文件格式: " + ext);
        }

        // 按日期生成子目录: 年/月/日/
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String fileName = UUID.randomUUID().toString().replace("-", "") + "." + ext;
        String dirPath = uploadPath + "/" + datePath;
        File dir = new File(dirPath);
        if (!dir.exists() && !dir.mkdirs()) {
            return Result.error(500, "创建目录失败");
        }

        try {
            file.transferTo(new File(dirPath + "/" + fileName));
            String url = urlPrefix + "/" + datePath + "/" + fileName;
            log.info("文件上传成功: {}", url);
            return Result.success(Map.of("url", url, "name", originalName));
        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.error(500, "上传失败: " + e.getMessage());
        }
    }
}
