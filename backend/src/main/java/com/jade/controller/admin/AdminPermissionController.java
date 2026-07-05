package com.jade.controller.admin;

import com.jade.common.Result;
import com.jade.model.dto.PermissionDTO;
import com.jade.model.entity.Permission;
import com.jade.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "后台权限管理")
@RestController
@RequestMapping("/api/admin/permissions")
@RequiredArgsConstructor
public class AdminPermissionController {

    private final PermissionService permissionService;

    @Operation(summary = "权限列表")
    @GetMapping
    public Result<List<Permission>> listAll() {
        return Result.success(permissionService.listAll());
    }

    @Operation(summary = "创建权限")
    @PostMapping
    public Result<Void> create(@RequestBody PermissionDTO dto) {
        permissionService.create(dto);
        return Result.success();
    }

    @Operation(summary = "更新权限")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody PermissionDTO dto) {
        permissionService.update(id, dto);
        return Result.success();
    }

    @Operation(summary = "删除权限")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        permissionService.delete(id);
        return Result.success();
    }
}
