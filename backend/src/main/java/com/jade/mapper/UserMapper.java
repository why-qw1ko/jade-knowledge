package com.jade.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jade.model.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
