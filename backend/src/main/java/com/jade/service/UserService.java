package com.jade.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.model.dto.UserDTO;
import com.jade.model.vo.UserVO;
import java.util.List;

public interface UserService {
    IPage<UserVO> list(Integer pageNum, Integer pageSize, String keyword);
    UserVO getById(Long id);
    void create(UserDTO dto);
    void update(Long id, UserDTO dto);
    void delete(Long id);
    void assignRoles(Long userId, List<Long> roleIds);
    void resetPassword(Long id, String newPassword);
    UserVO getCurrentUser();
}
