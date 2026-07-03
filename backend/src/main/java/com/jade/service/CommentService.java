package com.jade.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.model.dto.CommentDTO;
import com.jade.model.vo.CommentVO;

public interface CommentService {
    IPage<CommentVO> listByArticle(Long articleId, Integer pageNum, Integer pageSize);
    void create(CommentDTO dto, Long userId);
    IPage<CommentVO> pendingList(Integer pageNum, Integer pageSize);
    void approve(Long id, Long auditorId);
    void reject(Long id, Long auditorId);
    void delete(Long id);
}
