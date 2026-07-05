package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.jade.common.BusinessException;
import com.jade.mapper.BannerMapper;
import com.jade.model.entity.Banner;
import com.jade.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerMapper bannerMapper;

    @Override
    public IPage<Banner> adminList(Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<Banner> wrapper = new LambdaQueryWrapper<Banner>()
                .orderByAsc(Banner::getSort)
                .orderByDesc(Banner::getCreateTime);
        return bannerMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public List<Banner> listActive() {
        return bannerMapper.selectList(
                new LambdaQueryWrapper<Banner>()
                        .eq(Banner::getStatus, 1)
                        .orderByAsc(Banner::getSort)
                        .orderByDesc(Banner::getCreateTime));
    }

    @Override
    public Banner getById(Long id) {
        return bannerMapper.selectById(id);
    }

    @Override
    public Long create(Banner banner) {
        bannerMapper.insert(banner);
        return banner.getId();
    }

    @Override
    public void update(Long id, Banner banner) {
        Banner existing = bannerMapper.selectById(id);
        if (existing == null) throw new BusinessException("轮播图不存在");
        banner.setId(id);
        bannerMapper.updateById(banner);
    }

    @Override
    public void delete(Long id) {
        bannerMapper.deleteById(id);
    }
}
