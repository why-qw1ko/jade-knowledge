package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.jade.mapper.*;
import com.jade.model.entity.*;
import com.jade.model.vo.DashboardVO;
import com.jade.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ArticleMapper articleMapper;
    private final UserMapper userMapper;
    private final CommentMapper commentMapper;

    @Override
    public DashboardVO getStats() {
        DashboardVO vo = new DashboardVO();
        vo.setTotalArticles(articleMapper.selectCount(null));
        vo.setTotalUsers(userMapper.selectCount(null));
        vo.setTotalComments(commentMapper.selectCount(null));
        vo.setPendingArticles(articleMapper.selectCount(
                new LambdaQueryWrapper<Article>().eq(Article::getStatus, 1)));
        vo.setPendingComments(commentMapper.selectCount(
                new LambdaQueryWrapper<Comment>().eq(Comment::getStatus, 0)));

        // 今日新增
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        vo.setTodayNewArticles(articleMapper.selectCount(
                new LambdaQueryWrapper<Article>().ge(Article::getCreateTime, todayStart)));
        vo.setTodayNewUsers(userMapper.selectCount(
                new LambdaQueryWrapper<User>().ge(User::getCreateTime, todayStart)));
        vo.setTodayNewComments(commentMapper.selectCount(
                new LambdaQueryWrapper<Comment>().ge(Comment::getCreateTime, todayStart)));
        return vo;
    }
}
