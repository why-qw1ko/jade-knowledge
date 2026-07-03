package com.jade.controller.admin;

import com.jade.common.Result;
import com.jade.model.dto.CategoryDTO;
import com.jade.model.vo.CategoryVO;
import com.jade.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "后台分类管理")
@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "分类列表")
    @GetMapping
    public Result<List<CategoryVO>> listAll() {
        return Result.success(categoryService.listAll());
    }

    @Operation(summary = "创建分类")
    @PostMapping
    public Result<Void> create(@RequestBody CategoryDTO dto) {
        categoryService.create(dto);
        return Result.success();
    }

    @Operation(summary = "更新分类")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody CategoryDTO dto) {
        categoryService.update(id, dto);
        return Result.success();
    }

    @Operation(summary = "删除分类")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }
}
