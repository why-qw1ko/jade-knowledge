package com.jade.service;

import com.jade.model.dto.CategoryDTO;
import com.jade.model.vo.CategoryVO;
import java.util.List;

public interface CategoryService {
    List<CategoryVO> listTree();
    List<CategoryVO> listAll();
    void create(CategoryDTO dto);
    void update(Long id, CategoryDTO dto);
    void delete(Long id);
}
