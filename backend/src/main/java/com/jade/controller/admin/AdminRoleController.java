package com.jade.controller.admin;

import com.jade.common.Result;
import com.jade.model.dto.RoleDTO;
import com.jade.model.entity.Permission;
import com.jade.model.entity.Role;
import com.jade.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "后台角色管理")
@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
public class AdminRoleController {

    private final RoleService roleService;

    @Operation(summary = "角色列表")
    @GetMapping
    public Result<List<Role>> listAll() {
        return Result.success(roleService.listAll());
    }

    @Operation(summary = "创建角色")
    @PostMapping
    public Result<Void> create(@RequestBody RoleDTO dto) {
        roleService.create(dto);
        return Result.success();
    }

    @Operation(summary = "更新角色")
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody RoleDTO dto) {
        roleService.update(id, dto);
        return Result.success();
    }

    @Operation(summary = "删除角色")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return Result.success();
    }

    @Operation(summary = "获取角色权限")
    @GetMapping("/{id}/permissions")
    public Result<List<Permission>> getPermissions(@PathVariable Long id) {
        return Result.success(roleService.getRolePermissions(id));
    }

    @Operation(summary = "分配权限")
    @PutMapping("/{id}/permissions")
    public Result<Void> assignPermissions(@PathVariable Long id, @RequestBody List<Long> permissionIds) {
        roleService.assignPermissions(id, permissionIds);
        return Result.success();
    }
}
