package com.jade.service;

import com.jade.model.dto.PermissionDTO;
import com.jade.model.entity.Permission;

import java.util.List;

public interface PermissionService {
    List<Permission> listAll();
    void create(PermissionDTO dto);
    void update(Long id, PermissionDTO dto);
    void delete(Long id);
}
