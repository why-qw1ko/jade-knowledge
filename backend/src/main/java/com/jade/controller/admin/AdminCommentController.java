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

    @Operation(summary = "删除评论")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        commentService.delete(id);
        return Result.success();
    }
}
