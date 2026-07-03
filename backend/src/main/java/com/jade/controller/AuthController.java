package com.jade.controller;

import com.jade.common.Result;
import com.jade.model.dto.LoginRequest;
import com.jade.model.dto.RegisterRequest;
import com.jade.model.vo.LoginVO;
import com.jade.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "认证接口")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(authService.login(request));
    }

    @Operation(summary = "用户注册")
    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return Result.success();
    }

    @Operation(summary = "刷新令牌")
    @PostMapping("/refresh")
    public Result<LoginVO> refreshToken(@RequestParam String refreshToken) {
        return Result.success(authService.refreshToken(refreshToken));
    }
}
