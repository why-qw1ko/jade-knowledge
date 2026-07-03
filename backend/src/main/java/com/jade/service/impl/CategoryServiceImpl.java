package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.jade.common.BusinessException;
import com.jade.mapper.ArticleMapper;
import com.jade.mapper.CategoryMapper;
import com.jade.model.dto.CategoryDTO;
import com.jade.model.entity.Article;
import com.jade.model.entity.Category;
import com.jade.model.vo.CategoryVO;
import com.jade.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;
    private final ArticleMapper articleMapper;

    @Override
    public List<CategoryVO> listTree() {
        List<Category> all = categoryMapper.selectList(
                new LambdaQueryWrapper<Category>().eq(Category::getStatus, 1).orderByAsc(Category::getSort));
        List<CategoryVO> voList = all.stream().map(this::toVO).collect(Collectors.toList());
        return buildTree(voList, 0L);
    }

    @Override
    public List<CategoryVO> listAll() {
        List<Category> all = categoryMapper.selectList(
                new LambdaQueryWrapper<Category>().orderByAsc(Category::getSort));
        return all.stream().map(this::toVO).collect(Collectors.toList());
    }

    @Override
    public void create(CategoryDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setParentId(dto.getParentId() != null ? dto.getParentId() : 0L);
        category.setLevel(dto.getLevel() != null ? dto.getLevel() : 1);
        category.setSort(dto.getSort() != null ? dto.getSort() : 0);
        category.setIcon(dto.getIcon());
        category.setDescription(dto.getDescription());
        category.setStatus(1);
        categoryMapper.insert(category);
    }

    @Override
    public void update(Long id, CategoryDTO dto) {
        Category category = categoryMapper.selectById(id);
        if (category == null) throw new BusinessException("分类不存在");
        if (dto.getName() != null) category.setName(dto.getName());
        if (dto.getParentId() != null) category.setParentId(dto.getParentId());
        if (dto.getLevel() != null) category.setLevel(dto.getLevel());
        if (dto.getSort() != null) category.setSort(dto.getSort());
        if (dto.getIcon() != null) category.setIcon(dto.getIcon());
        if (dto.getDescription() != null) category.setDescription(dto.getDescription());
        categoryMapper.updateById(category);
    }

    @Override
    public void delete(Long id) {
        // 检查是否有子分类
        Long childCount = categoryMapper.selectCount(
                new LambdaQueryWrapper<Category>().eq(Category::getParentId, id));
        if (childCount > 0) throw new BusinessException("该分类下有子分类，无法删除");
        // 检查是否有文章
        Long articleCount = articleMapper.selectCount(
                new LambdaQueryWrapper<Article>().eq(Article::getCategoryId, id));
        if (articleCount > 0) throw new BusinessException("该分类下有文章，无法删除");
        categoryMapper.deleteById(id);
    }

    private CategoryVO toVO(Category c) {
        CategoryVO vo = new CategoryVO();
        vo.setId(c.getId());
        vo.setName(c.getName());
        vo.setParentId(c.getParentId());
        vo.setLevel(c.getLevel());
        vo.setSort(c.getSort());
        vo.setIcon(c.getIcon());
        vo.setDescription(c.getDescription());
        return vo;
    }

    private List<CategoryVO> buildTree(List<CategoryVO> list, Long parentId) {
        List<CategoryVO> tree = new ArrayList<>();
        for (CategoryVO vo : list) {
            if (parentId.equals(vo.getParentId())) {
                vo.setChildren(buildTree(list, vo.getId()));
                tree.add(vo);
            }
        }
        return tree;
    }
}
