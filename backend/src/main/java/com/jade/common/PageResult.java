package com.jade.common;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 分页结果封装
 */
@Data
public class PageResult<T> implements Serializable {

    /** 总记录数 */
    private long total;

    /** 当前页数据 */
    private List<T> records;

    /** 当前页码 */
    private long current;

    /** 每页大小 */
    private long size;

    /** 总页数 */
    private long pages;

    public PageResult() {}

    public PageResult(long total, List<T> records, long current, long size) {
        this.total = total;
        this.records = records;
        this.current = current;
        this.size = size;
        this.pages = (total + size - 1) / size;
    }
}
