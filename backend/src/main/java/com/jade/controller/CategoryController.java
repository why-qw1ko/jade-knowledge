package com.jade.controller;

import com.jade.common.Result;
import com.jade.model.vo.CategoryVO;
import com.jade.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "分类公开接口")
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "分类树形列表")
    @GetMapping
    public Result<List<CategoryVO>> listTree() {
        return Result.success(categoryService.listTree());
    }
}
