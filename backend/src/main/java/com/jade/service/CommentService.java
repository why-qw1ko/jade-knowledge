package com.jade.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.model.dto.CommentDTO;
import com.jade.model.vo.CommentVO;

public interface CommentService {
    IPage<CommentVO> listByArticle(Long articleId, Integer pageNum, Integer pageSize, Long currentUserId);
    void create(CommentDTO dto, Long userId);
    IPage<CommentVO> listAll(Integer status, Integer pageNum, Integer pageSize);
    IPage<CommentVO> pendingList(Integer pageNum, Integer pageSize);
    void approve(Long id, Long auditorId);
    void reject(Long id, Long auditorId);
    void update(Long id, String content);
    void delete(Long id);
}
