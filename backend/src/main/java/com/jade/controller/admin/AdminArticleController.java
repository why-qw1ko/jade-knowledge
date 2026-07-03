package com.jade.controller.admin;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.common.Result;
import com.jade.model.dto.ArticleDTO;
import com.jade.model.vo.ArticleDetailVO;
import com.jade.model.vo.ArticleVO;
import com.jade.security.LoginUser;
import com.jade.service.ArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "后台文章管理")
@RestController
@RequestMapping("/api/admin/articles")
@RequiredArgsConstructor
public class AdminArticleController {

    private final ArticleService articleService;

    @Operation(summary = "文章列表（管理）")
    @GetMapping
    public Result<IPage<ArticleVO>> adminList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(articleService.adminList(pageNum, pageSize, keyword, status, categoryId));
    }

    @Operation(summary = "文章详情（管理）")
    @GetMapping("/{id}")
    public Result<ArticleDetailVO> adminGetDetail(@PathVariable Long id) {
        return Result.success(articleService.adminGetDetail(id));
    }

    @Operation(summary = "创建文章")
    @PostMapping
    public Result<Long> create(@RequestBody ArticleDTO dto,
                               @AuthenticationPrincipal LoginUser loginUser) {
        return Result.success(articleService.create(dto, loginUser.getUserId()));
    }

    @Operation(summary = "更新文章")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody ArticleDTO dto) {
        articleService.update(id, dto);
        return Result.success();
    }

    @Operation(summary = "更新文章状态")
    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        articleService.updateStatus(id, status);
        return Result.success();
    }

    @Operation(summary = "删除文章")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        articleService.delete(id);
        return Result.success();
    }
}
