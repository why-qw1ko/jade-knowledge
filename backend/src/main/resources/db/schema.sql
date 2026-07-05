-- ============================================
-- 翡翠知识平台数据库建表脚本
-- ============================================

CREATE DATABASE IF NOT EXISTS jade_knowledge DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jade_knowledge;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码',
    `nickname` VARCHAR(100) DEFAULT NULL COMMENT '昵称',
    `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0-禁用 1-正常',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_email` (`email`),
    KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 角色表
CREATE TABLE IF NOT EXISTS `role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '角色ID',
    `name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0-禁用 1-正常',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 权限表
CREATE TABLE IF NOT EXISTS `permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '权限ID',
    `name` VARCHAR(100) NOT NULL COMMENT '权限名称',
    `code` VARCHAR(100) NOT NULL COMMENT '权限编码',
    `type` TINYINT NOT NULL DEFAULT 1 COMMENT '类型 1-菜单 2-按钮 3-接口',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父权限ID',
    `path` VARCHAR(200) DEFAULT NULL COMMENT '路由路径',
    `icon` VARCHAR(100) DEFAULT NULL COMMENT '图标',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS `user_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
    KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS `role_permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `permission_id` BIGINT NOT NULL COMMENT '权限ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_perm` (`role_id`, `permission_id`),
    KEY `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 分类表（支持树形结构）
CREATE TABLE IF NOT EXISTS `category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父分类ID，0表示顶级',
    `level` TINYINT NOT NULL DEFAULT 1 COMMENT '层级',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `icon` VARCHAR(200) DEFAULT NULL COMMENT '图标',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0-禁用 1-正常',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- 文章表
CREATE TABLE IF NOT EXISTS `article` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '文章ID',
    `title` VARCHAR(200) NOT NULL COMMENT '标题',
    `content` LONGTEXT COMMENT '正文内容（富文本/Markdown）',
    `content_format` VARCHAR(20) NOT NULL DEFAULT 'html' COMMENT '内容格式 html/markdown',
    `summary` VARCHAR(500) DEFAULT NULL COMMENT '摘要',
    `cover_image` VARCHAR(500) DEFAULT NULL COMMENT '封面图URL',
    `category_id` BIGINT DEFAULT NULL COMMENT '分类ID',
    `author_id` BIGINT NOT NULL COMMENT '作者ID',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0-草稿 1-待审核 2-已发布 3-已下线',
    `view_count` BIGINT NOT NULL DEFAULT 0 COMMENT '浏览量',
    `like_count` BIGINT NOT NULL DEFAULT 0 COMMENT '点赞数',
    `favorite_count` BIGINT NOT NULL DEFAULT 0 COMMENT '收藏数',
    `comment_count` BIGINT NOT NULL DEFAULT 0 COMMENT '评论数',
    `tags` VARCHAR(500) DEFAULT NULL COMMENT '标签，逗号分隔',
    `source` VARCHAR(100) DEFAULT NULL COMMENT '来源',
    `source_url` VARCHAR(500) DEFAULT NULL COMMENT '来源URL',
    `is_top` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶 0-否 1-是',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_author_id` (`author_id`),
    KEY `idx_status` (`status`),
    KEY `idx_create_time` (`create_time`),
    FULLTEXT KEY `ft_title_content` (`title`, `content`) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- 文章图片表
CREATE TABLE IF NOT EXISTS `article_image` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `article_id` BIGINT NOT NULL COMMENT '文章ID',
    `image_url` VARCHAR(500) NOT NULL COMMENT '图片URL',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_article_id` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章图片表';

-- 文章视频表
CREATE TABLE IF NOT EXISTS `article_video` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `article_id` BIGINT NOT NULL COMMENT '文章ID',
    `video_url` VARCHAR(500) NOT NULL COMMENT '视频URL',
    `cover_url` VARCHAR(500) DEFAULT NULL COMMENT '视频封面URL',
    `duration` INT DEFAULT 0 COMMENT '视频时长（秒）',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_article_id` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章视频表';

-- 评论表
CREATE TABLE IF NOT EXISTS `comment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评论ID',
    `article_id` BIGINT NOT NULL COMMENT '文章ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父评论ID，0表示顶级评论',
    `reply_user_id` BIGINT DEFAULT NULL COMMENT '被回复用户ID',
    `content` TEXT NOT NULL COMMENT '评论内容',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0-待审核 1-已通过 2-已拒绝',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_article_id` (`article_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 收藏表
CREATE TABLE IF NOT EXISTS `favorite` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `article_id` BIGINT NOT NULL COMMENT '文章ID',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_article` (`user_id`, `article_id`),
    KEY `idx_article_id` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- 爬虫任务表
CREATE TABLE IF NOT EXISTS `crawl_task` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '任务ID',
    `name` VARCHAR(100) NOT NULL COMMENT '任务名称',
    `url` VARCHAR(500) NOT NULL COMMENT '目标URL',
    `type` VARCHAR(50) DEFAULT NULL COMMENT '爬取类型',
    `schedule_cron` VARCHAR(50) DEFAULT NULL COMMENT '定时表达式',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0-待执行 1-执行中 2-已完成 3-失败',
    `last_run_time` DATETIME DEFAULT NULL COMMENT '上次执行时间',
    `run_count` INT NOT NULL DEFAULT 0 COMMENT '执行次数',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫任务表';

-- 爬取结果表
CREATE TABLE IF NOT EXISTS `crawl_result` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '结果ID',
    `task_id` BIGINT NOT NULL COMMENT '任务ID',
    `title` VARCHAR(200) DEFAULT NULL COMMENT '标题',
    `content` LONGTEXT COMMENT '原始内容',
    `clean_content` LONGTEXT COMMENT '清洗后内容',
    `source_url` VARCHAR(500) DEFAULT NULL COMMENT '来源URL',
    `source` VARCHAR(100) DEFAULT NULL COMMENT '来源站点',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态 0-待审核 1-已通过 2-已拒绝 3-已发布',
    `audit_user_id` BIGINT DEFAULT NULL COMMENT '审核人ID',
    `audit_remark` VARCHAR(500) DEFAULT NULL COMMENT '审核备注',
    `article_id` BIGINT DEFAULT NULL COMMENT '发布后的文章ID',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_task_id` (`task_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬取结果表';

-- 轮播图表
CREATE TABLE IF NOT EXISTS `banner` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '轮播图ID',
    `title` VARCHAR(100) NOT NULL COMMENT '标题',
    `image_url` VARCHAR(500) NOT NULL COMMENT '图片URL',
    `link_url` VARCHAR(500) DEFAULT NULL COMMENT '自定义链接',
    `article_id` BIGINT DEFAULT NULL COMMENT '关联文章ID',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='轮播图表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS `system_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '配置ID',
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT COMMENT '配置值',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 公告表
CREATE TABLE IF NOT EXISTS `announcement` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '公告ID',
    `title` VARCHAR(200) NOT NULL COMMENT '标题',
    `content` TEXT NOT NULL COMMENT '内容',
    `type` TINYINT NOT NULL DEFAULT 0 COMMENT '类型 0-普通公告 1-重要公告 2-紧急公告',
    `is_top` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶 0-否 1-是',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0-草稿 1-已发布 2-已下线',
    `publish_time` DATETIME DEFAULT NULL COMMENT '发布时间',
    `author_id` BIGINT DEFAULT NULL COMMENT '作者ID',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_publish_time` (`publish_time`),
    KEY `idx_is_top` (`is_top`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告表';

-- ============================================
-- 初始化数据
-- ============================================

-- 初始化角色
INSERT INTO `role` (`name`, `code`, `description`) VALUES
('超级管理员', 'ADMIN', '拥有全部权限'),
('审核员', 'AUDITOR', '负责内容审核'),
('普通用户', 'USER', '基础用户权限');

-- 初始化默认管理员用户（密码: admin123，BCrypt加密）
INSERT INTO `user` (`username`, `password`, `nickname`, `status`) VALUES
('admin', '$2b$10$jGqU2QlhRze4BNGQ2VWLWO2SEDylwqSTzA4HkpWIwHRhXvZtJB35C', '超级管理员', 1);

-- 管理员角色关联
INSERT INTO `user_role` (`user_id`, `role_id`) VALUES (1, 1);

-- 初始化默认分类
INSERT INTO `category` (`name`, `parent_id`, `level`, `sort`) VALUES
('玉石鉴赏', 0, 1, 1),
('玉石文化', 0, 1, 2),
('玉石保养', 0, 1, 3),
('市场行情', 0, 1, 4),
('玉石种类', 0, 1, 5),
('种水分类', 1, 2, 1),
('颜色分类', 1, 2, 2),
('雕工鉴赏', 1, 2, 3),
('历史渊源', 2, 2, 1),
('寓意象征', 2, 2, 2),
('日常保养', 3, 2, 1),
('修复工艺', 3, 2, 2),
('行情分析', 4, 2, 1),
('投资指南', 4, 2, 2),
('翡翠', 5, 2, 1),
('和田玉', 5, 2, 2),
('独山玉', 5, 2, 3),
('岫玉', 5, 2, 4),
('绿松石', 5, 2, 5);

-- 初始化系统配置
INSERT INTO `system_config` (`config_key`, `config_value`, `description`) VALUES
('site_name', '玉石知识平台', '站点名称'),
('site_logo', '/uploads/logo.png', '站点Logo'),
('site_description', '专业的玉石知识分享与学习平台', '站点描述'),
('register_enabled', 'true', '是否开放注册'),
('comment_audit_enabled', 'true', '评论是否需要审核'),
('crawl_enabled', 'true', '爬虫功能是否启用'),
('banner_enabled', 'false', '首页是否启用轮播图');
