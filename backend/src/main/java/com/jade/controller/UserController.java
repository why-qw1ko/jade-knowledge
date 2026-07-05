package com.jade.controller;

import com.jade.common.Result;
import com.jade.model.dto.UserDTO;
import com.jade.model.vo.UserVO;
import com.jade.security.LoginUser;
import com.jade.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Tag(name = "用户接口")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Value("${upload.path:/data/uploads}")
    private String uploadPath;

    @Value("${upload.url-prefix:/uploads}")
    private String urlPrefix;

    @Operation(summary = "获取个人信息")
    @GetMapping("/profile")
    public Result<UserVO> getCurrentUser(@AuthenticationPrincipal LoginUser loginUser) {
        return Result.success(userService.getById(loginUser.getUserId()));
    }

    @Operation(summary = "更新个人信息")
    @PutMapping("/profile")
    public Result<Void> updateProfile(@RequestBody UserDTO dto,
                                      @AuthenticationPrincipal LoginUser loginUser) {
        userService.update(loginUser.getUserId(), dto);
        return Result.success();
    }

    @Operation(summary = "上传头像")
    @PostMapping("/avatar")
    public Result<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file,
                                                    @AuthenticationPrincipal LoginUser loginUser) {
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
        String[] allowedExts = {"jpg", "jpeg", "png", "gif", "webp"};
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
        String dirPath = uploadPath + "/avatars/" + datePath;
        File dir = new File(dirPath);
        if (!dir.exists() && !dir.mkdirs()) {
            return Result.error(500, "创建目录失败");
        }

        try {
            file.transferTo(new File(dirPath + "/" + fileName));
            String url = urlPrefix + "/avatars/" + datePath + "/" + fileName;
            log.info("头像上传成功: {}", url);

            // 更新用户头像
            UserDTO dto = new UserDTO();
            dto.setAvatar(url);
            userService.update(loginUser.getUserId(), dto);

            return Result.success(Map.of("url", url, "name", originalName));
        } catch (IOException e) {
            log.error("头像上传失败", e);
            return Result.error(500, "上传失败: " + e.getMessage());
        }
    }
}
