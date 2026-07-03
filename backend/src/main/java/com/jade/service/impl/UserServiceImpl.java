package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jade.common.BusinessException;
import com.jade.mapper.*;
import com.jade.model.dto.UserDTO;
import com.jade.model.entity.*;
import com.jade.model.vo.UserVO;
import com.jade.security.SecurityUtils;
import com.jade.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final RoleMapper roleMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public IPage<UserVO> list(Integer pageNum, Integer pageSize, String keyword) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(User::getUsername, keyword)
                    .or().like(User::getNickname, keyword)
                    .or().like(User::getEmail, keyword);
        }
        wrapper.orderByDesc(User::getCreateTime);
        IPage<User> page = userMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        return page.convert(this::toVO);
    }

    @Override
    public UserVO getById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) throw new BusinessException("用户不存在");
        return toVO(user);
    }

    @Override
    @Transactional
    public void create(UserDTO dto) {
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, dto.getUsername()));
        if (count > 0) throw new BusinessException("用户名已存在");

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode("123456")); // 默认密码
        user.setNickname(dto.getNickname());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setAvatar(dto.getAvatar());
        user.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        userMapper.insert(user);
    }

    @Override
    public void update(Long id, UserDTO dto) {
        User user = userMapper.selectById(id);
        if (user == null) throw new BusinessException("用户不存在");
        if (StringUtils.hasText(dto.getNickname())) user.setNickname(dto.getNickname());
        if (StringUtils.hasText(dto.getEmail())) user.setEmail(dto.getEmail());
        if (StringUtils.hasText(dto.getPhone())) user.setPhone(dto.getPhone());
        if (StringUtils.hasText(dto.getAvatar())) user.setAvatar(dto.getAvatar());
        if (dto.getStatus() != null) user.setStatus(dto.getStatus());
        userMapper.updateById(user);
    }

    @Override
    public void delete(Long id) {
        userMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void assignRoles(Long userId, List<Long> roleIds) {
        userRoleMapper.delete(new LambdaQueryWrapper<UserRole>().eq(UserRole::getUserId, userId));
        for (Long roleId : roleIds) {
            UserRole ur = new UserRole();
            ur.setUserId(userId);
            ur.setRoleId(roleId);
            userRoleMapper.insert(ur);
        }
    }

    @Override
    public UserVO getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(401, "未登录");
        return getById(userId);
    }

    private UserVO toVO(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setAvatar(user.getAvatar());
        vo.setEmail(user.getEmail());
        vo.setPhone(user.getPhone());
        vo.setStatus(user.getStatus());
        vo.setCreateTime(user.getCreateTime());
        // 获取角色
        List<UserRole> urs = userRoleMapper.selectList(
                new LambdaQueryWrapper<UserRole>().eq(UserRole::getUserId, user.getId()));
        if (!urs.isEmpty()) {
            List<Long> roleIds = urs.stream().map(UserRole::getRoleId).collect(Collectors.toList());
            vo.setRoles(roleMapper.selectBatchIds(roleIds).stream()
                    .map(Role::getCode).collect(Collectors.toList()));
        }
        return vo;
    }
}
