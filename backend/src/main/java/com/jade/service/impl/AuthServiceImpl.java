package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.jade.common.BusinessException;
import com.jade.mapper.*;
import com.jade.model.dto.LoginRequest;
import com.jade.model.dto.RegisterRequest;
import com.jade.model.entity.*;
import com.jade.model.vo.LoginVO;
import com.jade.model.vo.UserVO;
import com.jade.security.JwtUtils;
import com.jade.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final RoleMapper roleMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public LoginVO login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));

        List<String> roles = getUserRoles(user.getId());

        String accessToken = jwtUtils.generateAccessToken(user.getId(), user.getUsername(), roles);
        String refreshToken = jwtUtils.generateRefreshToken(user.getId(), user.getUsername());

        UserVO userVO = new UserVO();
        userVO.setId(user.getId());
        userVO.setUsername(user.getUsername());
        userVO.setNickname(user.getNickname());
        userVO.setAvatar(user.getAvatar());
        userVO.setRoles(roles);

        LoginVO vo = new LoginVO();
        vo.setAccessToken(accessToken);
        vo.setRefreshToken(refreshToken);
        vo.setUser(userVO);
        return vo;
    }

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        // 检查用户名唯一
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));
        if (count > 0) {
            throw new BusinessException("用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setEmail(request.getEmail());
        user.setStatus(1);
        userMapper.insert(user);

        // 分配默认用户角色
        Role userRole = roleMapper.selectOne(
                new LambdaQueryWrapper<Role>().eq(Role::getCode, "USER"));
        if (userRole != null) {
            UserRole ur = new UserRole();
            ur.setUserId(user.getId());
            ur.setRoleId(userRole.getId());
            userRoleMapper.insert(ur);
        }
    }

    @Override
    public LoginVO refreshToken(String refreshToken) {
        if (!jwtUtils.validateToken(refreshToken)) {
            throw new BusinessException(401, "刷新令牌无效或已过期");
        }
        Long userId = jwtUtils.getUserId(refreshToken);
        String username = jwtUtils.getUsername(refreshToken);
        User user = userMapper.selectById(userId);
        if (user == null) throw new BusinessException("用户不存在");

        List<String> roles = getUserRoles(userId);
        String accessToken = jwtUtils.generateAccessToken(userId, username, roles);
        String newRefreshToken = jwtUtils.generateRefreshToken(userId, username);

        UserVO userVO = new UserVO();
        userVO.setId(user.getId());
        userVO.setUsername(user.getUsername());
        userVO.setNickname(user.getNickname());
        userVO.setRoles(roles);

        LoginVO vo = new LoginVO();
        vo.setAccessToken(accessToken);
        vo.setRefreshToken(newRefreshToken);
        vo.setUser(userVO);
        return vo;
    }

    private List<String> getUserRoles(Long userId) {
        List<UserRole> urs = userRoleMapper.selectList(
                new LambdaQueryWrapper<UserRole>().eq(UserRole::getUserId, userId));
        if (urs.isEmpty()) return Collections.emptyList();
        List<Long> roleIds = urs.stream().map(UserRole::getRoleId).collect(Collectors.toList());
        return roleMapper.selectBatchIds(roleIds).stream()
                .map(Role::getCode).collect(Collectors.toList());
    }
}
