package com.jade.security;

import com.jade.mapper.*;
import com.jade.model.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/** 用户详情服务 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final RoleMapper roleMapper;
    private final RolePermissionMapper rolePermissionMapper;
    private final PermissionMapper permissionMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<User>()
                        .eq(User::getUsername, username));
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在: " + username);
        }

        // 获取角色
        List<UserRole> userRoles = userRoleMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<UserRole>()
                        .eq(UserRole::getUserId, user.getId()));
        List<Long> roleIds = userRoles.stream().map(UserRole::getRoleId).collect(Collectors.toList());

        List<String> roles = roleIds.isEmpty() ? Collections.emptyList() :
                roleMapper.selectBatchIds(roleIds).stream()
                        .map(Role::getCode).collect(Collectors.toList());

        // 获取权限
        List<Long> permIds = roleIds.isEmpty() ? Collections.emptyList() :
                rolePermissionMapper.selectList(
                        new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<RolePermission>()
                                .in(RolePermission::getRoleId, roleIds))
                        .stream().map(RolePermission::getPermissionId).collect(Collectors.toList());

        List<String> permissions = permIds.isEmpty() ? Collections.emptyList() :
                permissionMapper.selectBatchIds(permIds).stream()
                        .map(Permission::getCode).collect(Collectors.toList());

        return new LoginUser(user, roles, permissions);
    }
}
