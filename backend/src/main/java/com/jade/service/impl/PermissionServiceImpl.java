package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.jade.common.BusinessException;
import com.jade.mapper.PermissionMapper;
import com.jade.model.dto.PermissionDTO;
import com.jade.model.entity.Permission;
import com.jade.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionMapper permissionMapper;

    @Override
    public List<Permission> listAll() {
        return permissionMapper.selectList(new LambdaQueryWrapper<Permission>()
                .orderByAsc(Permission::getSort).orderByAsc(Permission::getId));
    }

    @Override
    public void create(PermissionDTO dto) {
        Permission permission = new Permission();
        permission.setName(dto.getName());
        permission.setCode(dto.getCode());
        permission.setType(dto.getType());
        permission.setParentId(dto.getParentId() != null ? dto.getParentId() : 0L);
        permission.setPath(dto.getPath());
        permission.setIcon(dto.getIcon());
        permission.setSort(dto.getSort() != null ? dto.getSort() : 0);
        permissionMapper.insert(permission);
    }

    @Override
    public void update(Long id, PermissionDTO dto) {
        Permission permission = permissionMapper.selectById(id);
        if (permission == null) throw new BusinessException("权限不存在");
        if (dto.getName() != null) permission.setName(dto.getName());
        if (dto.getCode() != null) permission.setCode(dto.getCode());
        if (dto.getType() != null) permission.setType(dto.getType());
        if (dto.getParentId() != null) permission.setParentId(dto.getParentId());
        if (dto.getPath() != null) permission.setPath(dto.getPath());
        if (dto.getIcon() != null) permission.setIcon(dto.getIcon());
        if (dto.getSort() != null) permission.setSort(dto.getSort());
        permissionMapper.updateById(permission);
    }

    @Override
    public void delete(Long id) {
        permissionMapper.deleteById(id);
    }
}
