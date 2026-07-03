package com.jade.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.common.Result;
import com.jade.model.vo.ArticleVO;
import com.jade.security.LoginUser;
import com.jade.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "收藏接口")
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @Operation(summary = "收藏/取消收藏")
    @PostMapping("/articles/{articleId}")
    public Result<Boolean> toggle(@PathVariable Long articleId,
                                  @AuthenticationPrincipal LoginUser loginUser) {
        return Result.success(favoriteService.toggle(loginUser.getUserId(), articleId));
    }

    @Operation(summary = "我的收藏列表")
    @GetMapping
    public Result<IPage<ArticleVO>> listMyFavorites(
            @AuthenticationPrincipal LoginUser loginUser,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(favoriteService.listByUser(loginUser.getUserId(), pageNum, pageSize));
    }
}
