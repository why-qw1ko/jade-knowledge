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
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

        // 分类文章数分布
        vo.setCategoryStats(articleMapper.selectCategoryStats());

        // 文章状态分布
        vo.setArticleStatusStats(List.of(
                new DashboardVO.StatusStat("草稿", articleMapper.selectCount(
                        new LambdaQueryWrapper<Article>().eq(Article::getStatus, 0))),
                new DashboardVO.StatusStat("待审核", articleMapper.selectCount(
                        new LambdaQueryWrapper<Article>().eq(Article::getStatus, 1))),
                new DashboardVO.StatusStat("已发布", articleMapper.selectCount(
                        new LambdaQueryWrapper<Article>().eq(Article::getStatus, 2))),
                new DashboardVO.StatusStat("已下线", articleMapper.selectCount(
                        new LambdaQueryWrapper<Article>().eq(Article::getStatus, 3)))
        ));

        // 近7天每日新增趋势
        vo.setRecentTrend(buildRecentTrend());

        return vo;
    }

    private List<DashboardVO.DayTrend> buildRecentTrend() {
        LocalDate today = LocalDate.now();
        LocalDateTime sevenDaysAgo = LocalDateTime.of(today.minusDays(6), LocalTime.MIN);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM-dd");

        // 查询近7天数据
        List<Article> articles = articleMapper.selectList(
                new LambdaQueryWrapper<Article>().ge(Article::getCreateTime, sevenDaysAgo));
        List<User> users = userMapper.selectList(
                new LambdaQueryWrapper<User>().ge(User::getCreateTime, sevenDaysAgo));
        List<Comment> comments = commentMapper.selectList(
                new LambdaQueryWrapper<Comment>().ge(Comment::getCreateTime, sevenDaysAgo));

        // 按日期分组计数
        Map<String, Long> articleMap = articles.stream()
                .collect(Collectors.groupingBy(a -> a.getCreateTime().toLocalDate().toString(), Collectors.counting()));
        Map<String, Long> userMap = users.stream()
                .collect(Collectors.groupingBy(u -> u.getCreateTime().toLocalDate().toString(), Collectors.counting()));
        Map<String, Long> commentMap = comments.stream()
                .collect(Collectors.groupingBy(c -> c.getCreateTime().toLocalDate().toString(), Collectors.counting()));

        // 构建7天数据（含0值）
        return java.util.stream.IntStream.range(0, 7)
                .mapToObj(i -> {
                    LocalDate date = today.minusDays(6 - i);
                    String key = date.toString();
                    return new DashboardVO.DayTrend(
                            date.format(fmt),
                            articleMap.getOrDefault(key, 0L),
                            userMap.getOrDefault(key, 0L),
                            commentMap.getOrDefault(key, 0L));
                })
                .collect(Collectors.toList());
    }
}
