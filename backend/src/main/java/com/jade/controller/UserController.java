package com.jade.controller;

import com.jade.common.Result;
import com.jade.model.dto.UserDTO;
import com.jade.model.vo.UserVO;
import com.jade.security.LoginUser;
import com.jade.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "用户接口")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

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
}
