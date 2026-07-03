package com.jade.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jade.model.entity.Favorite;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FavoriteMapper extends BaseMapper<Favorite> {
}
