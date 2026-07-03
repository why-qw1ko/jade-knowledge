package com.jade.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 注册请求 */
@Data
public class RegisterRequest {
    @NotBlank(message = "用户名不能为空")
    private String username;
    @NotBlank(message = "密码不能为空")
    private String password;
    private String nickname;
    private String email;
}
