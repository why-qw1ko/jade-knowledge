package com.jade.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.model.dto.ArticleDTO;
import com.jade.model.entity.Article;
import com.jade.model.vo.ArticleDetailVO;
import com.jade.model.vo.ArticleVO;

import java.util.List;

public interface ArticleService {
    IPage<ArticleVO> list(Integer pageNum, Integer pageSize, Long categoryId, String keyword, Integer status);
    ArticleDetailVO getDetail(Long id);
    IPage<ArticleVO> adminList(Integer pageNum, Integer pageSize, String keyword, Integer status, Long categoryId);
    ArticleDetailVO adminGetDetail(Long id);
    Long create(ArticleDTO dto, Long authorId);
    void update(Long id, ArticleDTO dto);
    void updateStatus(Long id, Integer status);
    void delete(Long id);
    IPage<ArticleVO> search(String keyword, Integer pageNum, Integer pageSize);
    List<Article> searchByTitle(String title);
}
