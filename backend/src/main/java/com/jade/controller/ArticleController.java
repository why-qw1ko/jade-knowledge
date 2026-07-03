package com.jade.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.common.Result;
import com.jade.model.vo.ArticleDetailVO;
import com.jade.model.vo.ArticleVO;
import com.jade.service.ArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "文章公开接口")
@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @Operation(summary = "文章列表")
    @GetMapping
    public Result<IPage<ArticleVO>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        return Result.success(articleService.list(pageNum, pageSize, categoryId, keyword, 2));
    }

    @Operation(summary = "文章详情")
    @GetMapping("/{id}")
    public Result<ArticleDetailVO> getDetail(@PathVariable Long id) {
        return Result.success(articleService.getDetail(id));
    }
}
