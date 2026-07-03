package com.jade.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.common.Result;
import com.jade.model.vo.ArticleVO;
import com.jade.service.ArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "搜索接口")
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final ArticleService articleService;

    @Operation(summary = "全文搜索")
    @GetMapping
    public Result<IPage<ArticleVO>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(articleService.search(q, pageNum, pageSize));
    }
}
