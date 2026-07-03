package com.jade.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jade.model.entity.Permission;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PermissionMapper extends BaseMapper<Permission> {
}
