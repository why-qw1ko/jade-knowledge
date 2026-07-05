package com.jade.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.jade.model.entity.Banner;

import java.util.List;

public interface BannerService {

    /** 后台分页查询（全部状态） */
    IPage<Banner> adminList(Integer pageNum, Integer pageSize);

    /** 前台查询启用的轮播图（按sort排序） */
    List<Banner> listActive();

    /** 根据ID查询 */
    Banner getById(Long id);

    /** 创建 */
    Long create(Banner banner);

    /** 更新 */
    void update(Long id, Banner banner);

    /** 删除 */
    void delete(Long id);
}
