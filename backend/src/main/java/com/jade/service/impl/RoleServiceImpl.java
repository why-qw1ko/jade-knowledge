package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.jade.common.BusinessException;
import com.jade.mapper.*;
import com.jade.model.dto.RoleDTO;
import com.jade.model.entity.*;
import com.jade.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleMapper roleMapper;
    private final RolePermissionMapper rolePermissionMapper;
    private final PermissionMapper permissionMapper;

    @Override
    public List<Role> listAll() {
        return roleMapper.selectList(new LambdaQueryWrapper<Role>().orderByAsc(Role::getId));
    }

    @Override
    public void create(RoleDTO dto) {
        Role role = new Role();
        role.setName(dto.getName());
        role.setCode(dto.getCode());
        role.setDescription(dto.getDescription());
        role.setStatus(1);
        roleMapper.insert(role);
    }

    @Override
    public void update(Long id, RoleDTO dto) {
        Role role = roleMapper.selectById(id);
        if (role == null) throw new BusinessException("角色不存在");
        if (dto.getName() != null) role.setName(dto.getName());
        if (dto.getCode() != null) role.setCode(dto.getCode());
        if (dto.getDescription() != null) role.setDescription(dto.getDescription());
        roleMapper.updateById(role);
    }

    @Override
    public void delete(Long id) {
        roleMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void assignPermissions(Long roleId, List<Long> permissionIds) {
        rolePermissionMapper.delete(new LambdaQueryWrapper<RolePermission>()
                .eq(RolePermission::getRoleId, roleId));
        for (Long permId : permissionIds) {
            RolePermission rp = new RolePermission();
            rp.setRoleId(roleId);
            rp.setPermissionId(permId);
            rolePermissionMapper.insert(rp);
        }
    }

    @Override
    public List<Permission> getRolePermissions(Long roleId) {
        List<RolePermission> rps = rolePermissionMapper.selectList(
                new LambdaQueryWrapper<RolePermission>().eq(RolePermission::getRoleId, roleId));
        if (rps.isEmpty()) return List.of();
        List<Long> permIds = rps.stream().map(RolePermission::getPermissionId).collect(Collectors.toList());
        return permissionMapper.selectBatchIds(permIds);
    }
}
