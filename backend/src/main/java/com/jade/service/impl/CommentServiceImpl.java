package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jade.common.BusinessException;
import com.jade.mapper.*;
import com.jade.model.dto.CommentDTO;
import com.jade.model.entity.*;
import com.jade.model.vo.CommentVO;
import com.jade.service.CommentService;
import com.jade.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentMapper commentMapper;
    private final UserMapper userMapper;
    private final ArticleMapper articleMapper;
    private final SystemConfigService systemConfigService;

    @Override
    public IPage<CommentVO> listByArticle(Long articleId, Integer pageNum, Integer pageSize) {
        // 获取顶级评论
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<Comment>()
                .eq(Comment::getArticleId, articleId)
                .eq(Comment::getParentId, 0)
                .eq(Comment::getStatus, 1)
                .orderByDesc(Comment::getCreateTime);
        IPage<Comment> page = commentMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        return page.convert(c -> toVO(c, true));
    }

    @Override
    @Transactional
    public void create(CommentDTO dto, Long userId) {
        String auditEnabled = systemConfigService.getConfig("comment_audit_enabled");
        Comment comment = new Comment();
        comment.setArticleId(dto.getArticleId());
        comment.setUserId(userId);
        comment.setContent(dto.getContent());
        comment.setParentId(dto.getParentId() != null ? dto.getParentId() : 0L);
        comment.setReplyUserId(dto.getReplyUserId());
        comment.setStatus("true".equals(auditEnabled) ? 0 : 1);
        commentMapper.insert(comment);

        // 更新文章评论数
        articleMapper.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<Article>()
                .eq(Article::getId, dto.getArticleId())
                .setSql("comment_count = comment_count + 1"));
    }

    @Override
    public IPage<CommentVO> pendingList(Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<Comment>()
                .eq(Comment::getStatus, 0)
                .orderByDesc(Comment::getCreateTime);
        IPage<Comment> page = commentMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        return page.convert(c -> toVO(c, false));
    }

    @Override
    public void approve(Long id, Long auditorId) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) throw new BusinessException("评论不存在");
        comment.setStatus(1);
        commentMapper.updateById(comment);
    }

    @Override
    public void reject(Long id, Long auditorId) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) throw new BusinessException("评论不存在");
        comment.setStatus(2);
        commentMapper.updateById(comment);
    }

    @Override
    public void delete(Long id) {
        commentMapper.deleteById(id);
    }

    private CommentVO toVO(Comment c, boolean loadChildren) {
        CommentVO vo = new CommentVO();
        vo.setId(c.getId());
        vo.setContent(c.getContent());
        vo.setUserId(c.getUserId());
        vo.setParentId(c.getParentId());
        vo.setReplyUserId(c.getReplyUserId());
        vo.setStatus(c.getStatus());
        vo.setCreateTime(c.getCreateTime());

        // 用户信息
        User user = userMapper.selectById(c.getUserId());
        if (user != null) {
            vo.setUserName(user.getNickname());
            vo.setUserAvatar(user.getAvatar());
        }
        if (c.getReplyUserId() != null) {
            User replyUser = userMapper.selectById(c.getReplyUserId());
            if (replyUser != null) vo.setReplyUserName(replyUser.getNickname());
        }

        // 加载子评论
        if (loadChildren && c.getParentId() == 0) {
            List<Comment> children = commentMapper.selectList(
                    new LambdaQueryWrapper<Comment>()
                            .eq(Comment::getParentId, c.getId())
                            .eq(Comment::getStatus, 1)
                            .orderByAsc(Comment::getCreateTime));
            vo.setChildren(children.stream().map(child -> toVO(child, false)).collect(Collectors.toList()));
        } else {
            vo.setChildren(new ArrayList<>());
        }
        return vo;
    }
}
