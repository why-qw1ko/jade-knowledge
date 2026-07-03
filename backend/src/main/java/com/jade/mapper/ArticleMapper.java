package com.jade.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jade.model.entity.Article;
import com.jade.model.vo.ArticleVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ArticleMapper extends BaseMapper<Article> {

    /** 分页查询文章列表（关联分类和作者） */
    IPage<ArticleVO> selectArticleVOPage(Page<ArticleVO> page,
                                          @Param("categoryId") Long categoryId,
                                          @Param("keyword") String keyword,
                                          @Param("status") Integer status);
}
