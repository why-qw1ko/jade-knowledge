package com.jade.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.common.Result;
import com.jade.model.dto.CommentDTO;
import com.jade.model.vo.CommentVO;
import com.jade.security.LoginUser;
import com.jade.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "评论接口")
@RestController
@RequestMapping("/api/articles/{articleId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "文章评论列表")
    @GetMapping
    public Result<IPage<CommentVO>> listByArticle(
            @PathVariable Long articleId,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @AuthenticationPrincipal LoginUser loginUser) {
        Long userId = loginUser != null ? loginUser.getUserId() : null;
        return Result.success(commentService.listByArticle(articleId, pageNum, pageSize, userId));
    }

    @Operation(summary = "发表评论")
    @PostMapping
    public Result<Void> create(@PathVariable Long articleId, @RequestBody CommentDTO dto,
                               @AuthenticationPrincipal LoginUser loginUser) {
        if (loginUser == null) {
            return Result.unauthorized("请先登录");
        }
        dto.setArticleId(articleId);
        commentService.create(dto, loginUser.getUserId());
        return Result.success();
    }
}
