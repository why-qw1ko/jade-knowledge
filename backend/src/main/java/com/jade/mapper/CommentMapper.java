package com.jade.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jade.model.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommentMapper extends BaseMapper<Comment> {
}
