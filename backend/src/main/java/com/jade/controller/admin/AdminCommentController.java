package com.jade.controller.admin;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.common.Result;
import com.jade.model.vo.CommentVO;
import com.jade.security.LoginUser;
import com.jade.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "后台评论管理")
@RestController
@RequestMapping("/api/admin/comments")
@RequiredArgsConstructor
public class AdminCommentController {

    private final CommentService commentService;

    @Operation(summary = "评论列表")
    @GetMapping
    public Result<IPage<CommentVO>> list(
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(commentService.listAll(status, pageNum, pageSize));
    }

    @Operation(summary = "待审核评论列表")
    @GetMapping("/pending")
    public Result<IPage<CommentVO>> pendingList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(commentService.pendingList(pageNum, pageSize));
    }

    @Operation(summary = "审核通过评论")
    @PostMapping("/{id}/approve")
    public Result<Void> approve(@PathVariable Long id, @AuthenticationPrincipal LoginUser loginUser) {
        commentService.approve(id, loginUser.getUserId());
        return Result.success();
    }

    @Operation(summary = "驳回评论")
    @PostMapping("/{id}/reject")
    public Result<Void> reject(@PathVariable Long id, @AuthenticationPrincipal LoginUser loginUser) {
        commentService.reject(id, loginUser.getUserId());
        return Result.success();
    }

    @Operation(summary = "编辑评论")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return Result.error(400, "评论内容不能为空");
        }
        commentService.update(id, content);
        return Result.success();
    }

    @Operation(summary = "删除评论")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        commentService.delete(id);
        return Result.success();
    }
}
