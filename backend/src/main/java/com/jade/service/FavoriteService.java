package com.jade.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.model.vo.ArticleVO;

public interface FavoriteService {
    boolean toggle(Long userId, Long articleId);
    IPage<ArticleVO> listByUser(Long userId, Integer pageNum, Integer pageSize);
    boolean isFavorited(Long userId, Long articleId);
}
