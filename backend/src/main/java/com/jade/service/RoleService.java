package com.jade.service;

import com.jade.model.dto.RoleDTO;
import com.jade.model.entity.Permission;
import com.jade.model.entity.Role;
import java.util.List;

public interface RoleService {
    List<Role> listAll();
    void create(RoleDTO dto);
    void update(Long id, RoleDTO dto);
    void delete(Long id);
    void assignPermissions(Long roleId, List<Long> permissionIds);
    List<Permission> getRolePermissions(Long roleId);
}
