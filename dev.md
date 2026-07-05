# 玉石知识内容平台 - 技术选型与开发文档

**项目名称**：`jade-knowledge`

**项目定位**：中型玉石知识内容平台，面向玉石爱好者提供翡翠、和田玉、碧玺、岫玉等品类的鉴别知识、收藏经验与文化科普内容。

---

## 一、技术栈选型

### 1.1 后端

| 技术     | 选型                      | 说明                                                         |
| -------- | ------------------------- | ------------------------------------------------------------ |
| 框架     | **Spring Boot 3.x**       | Java 生态主流框架，成熟稳定，社区活跃                        |
| 权限管理 | **Spring Security + JWT** | 基于 RBAC 的角色权限模型，支持动态扩展角色与权限配置         |
| AI 集成  | **Spring AI**             | 统一的大模型接入抽象层，支持切换 OpenAI / 通义千问 / DeepSeek 等 |
| ORM      | **MyBatis-Plus**          | 简化数据库操作，配合 MySQL 使用                              |
| 搜索引擎 | **Elasticsearch**         | 全文搜索，支持文章标题/正文/标签的模糊搜索与高亮             |
| 数据库   | **MySQL 8.0+**            | 存储用户、文章、评论、收藏、审核记录等结构化数据             |
| 缓存     | **Redis**                 | 缓存热点文章、用户会话、搜索热词等                           |
| 任务调度 | **Spring Task / XXL-Job** | 定时触发 AI 内容抓取任务                                     |
| API 文档 | **SpringDoc OpenAPI**     | 自动生成 Swagger 接口文档                                    |

### 1.2 前端

| 技术         | 选型                                       | 说明                                       |
| ------------ | ------------------------------------------ | ------------------------------------------ |
| 框架         | **Next.js 16 (App Router)**                | 支持 SSR/SSG，SEO 友好，全栈能力           |
| CSS 框架     | **Tailwind CSS v4**                        | 原子化 CSS                                 |
| 主题系统     | **CSS Custom Properties**                  | 亮色/暗色/跟随系统，通过 `[data-theme]` 切换 |
| UI 组件库    | **自定义组件** (`src/components/ui/`)      | Button/Card/Input/Select/Modal/Badge 等    |
| 状态管理     | **Zustand**                                | 轻量级状态管理（authStore + appStore）     |
| HTTP 请求    | **Axios**                                  | 与后端 API 通信，封装在 `src/lib/api.ts`   |
| 富文本编辑器 | **TipTap / Editor.js**                     | 后台文章编辑                               |
| 图标         | **lucide-react**                           | 统一图标库                                 |

### 1.3 数据存储

| 存储                | 用途                                                 |
| ------------------- | ---------------------------------------------------- |
| MySQL               | 用户、文章、评论、收藏、角色权限、审核记录、系统配置 |
| Elasticsearch       | 文章全文搜索索引                                     |
| Redis               | 缓存、会话、任务锁                                   |
| 对象存储（COS/OSS） | 图片、视频等媒体文件存储                             |

### 1.4 AI 集成

| 组件      | 说明                                              |
| --------- | ------------------------------------------------- |
| Spring AI | 统一大模型调用接口，支持多模型切换                |
| 支持模型  | OpenAI / 通义千问 / DeepSeek / 文心一言 等        |
| 配置方式  | 管理员在后台配置 API Key 和模型类型，支持开关控制 |

---

## 二、项目结构

```
jade-knowledge/
├── backend/                          # Spring Boot 后端
│   ├── src/main/java/com/jade/
│   │   ├── config/                   # 配置类（Spring AI、ES、Redis等）
│   │   ├── controller/               # REST API 控制器
│   │   ├── service/                  # 业务逻辑层
│   │   ├── mapper/                   # 数据访问层（MyBatis-Plus Mapper）
│   │   ├── model/                    # 实体类
│   │   │   ├── entity/               # 数据库实体
│   │   │   ├── dto/                  # 数据传输对象
│   │   │   └── vo/                   # 视图对象
│   │   ├── security/                 # Spring Security + JWT 权限
│   │   ├── ai/                       # AI 内容抓取与清洗模块
│   │   ├── search/                   # Elasticsearch 搜索模块
│   │   ├── task/                     # 定时任务
│   │   └── common/                   # 通用工具类、异常处理
│   ├── src/main/resources/
│   │   ├── application.yml           # 主配置
│   │   └── mapper/                   # MyBatis XML
│   └── pom.xml
├── frontend/                         # Next.js 前端
│   ├── src/
│   │   ├── app/                      # App Router 页面
│   │   │   ├── layout.tsx            # 根布局（含主题 FOWT 脚本）
│   │   │   ├── globals.css           # 全局样式 + CSS 主题变量
│   │   │   ├── page.tsx              # 首页
│   │   │   ├── articles/             # 文章列表/详情
│   │   │   ├── search/               # 搜索页
│   │   │   ├── login/                # 登录/注册
│   │   │   └── admin/                # 管理后台（仪表盘、文章、评论、分类、用户、角色、权限、抓取、配置）
│   │   ├── components/
│   │   │   ├── ui/                   # 基础 UI 组件（Button, Card, Input, Select, Modal, Badge, Pagination, Toast, Loading）
│   │   │   ├── layout/               # 布局组件（Header, Footer, AdminSidebar）
│   │   │   ├── admin/                # 后台业务组件（DataTable, StatsCard, RichTextEditor, MarkdownEditor, ImageUpload, VideoUpload）
│   │   │   ├── article/              # 文章组件（ArticleCard, ArticleList）
│   │   │   ├── comment/              # 评论组件
│   │   │   ├── search/               # 搜索组件
│   │   │   └── providers/            # Context Providers（AuthProvider, ThemeProvider）
│   │   ├── store/                    # Zustand 状态（authStore, appStore）
│   │   ├── lib/                      # 工具函数（api.ts, auth.ts）
│   │   └── hooks/                    # 自定义 Hooks（useAuth）
│   ├── public/                       # 静态资源
│   └── package.json
├── docs/                             # 项目文档
└── README.md
```

---

## 三、数据库设计（核心表结构）

### 3.1 用户与权限

```sql
-- 用户表
CREATE TABLE `user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(50),
  `avatar` VARCHAR(500),
  `email` VARCHAR(100),
  `status` TINYINT DEFAULT 1 COMMENT '1-正常 0-禁用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE `role` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码: ADMIN/AUDITOR/USER',
  `description` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 权限表
CREATE TABLE `permission` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `code` VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
  `type` VARCHAR(20) COMMENT 'MENU/BUTTON/API',
  `parent_id` BIGINT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户角色关联表
CREATE TABLE `user_role` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `role_id` BIGINT NOT NULL,
  UNIQUE KEY `uk_user_role` (`user_id`, `role_id`)
);

-- 角色权限关联表
CREATE TABLE `role_permission` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `role_id` BIGINT NOT NULL,
  `permission_id` BIGINT NOT NULL,
  UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`)
);
```

### 3.2 文章与内容

```sql
-- 文章分类表
CREATE TABLE `category` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(50) NOT NULL UNIQUE COMMENT 'URL友好名称',
  `parent_id` BIGINT DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 文章表
CREATE TABLE `article` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `summary` VARCHAR(500) COMMENT '文章摘要',
  `content` LONGTEXT COMMENT '文章正文(HTML/Markdown)',
  `cover_image` VARCHAR(500) COMMENT '封面图',
  `category_id` BIGINT,
  `tags` VARCHAR(200) COMMENT '标签，逗号分隔',
  `author_id` BIGINT COMMENT '作者(管理员)',
  `source` VARCHAR(50) COMMENT '来源: MANUAL/AI_CRAWL',
  `status` TINYINT DEFAULT 0 COMMENT '0-草稿 1-待审核 2-已发布 3-下架',
  `auditor_id` BIGINT COMMENT '审核员ID',
  `audit_comment` VARCHAR(500) COMMENT '审核意见',
  `audited_at` DATETIME COMMENT '审核时间',
  `published_at` DATETIME COMMENT '发布时间',
  `view_count` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_category` (`category_id`),
  INDEX `idx_published_at` (`published_at`)
);

-- 文章图片表
CREATE TABLE `article_image` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `article_id` BIGINT,
  `url` VARCHAR(500) NOT NULL,
  `alt_text` VARCHAR(200),
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 文章视频表
CREATE TABLE `article_video` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `article_id` BIGINT,
  `url` VARCHAR(500) NOT NULL,
  `title` VARCHAR(200),
  `cover_image` VARCHAR(500),
  `duration` INT COMMENT '时长(秒)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 评论与收藏

```sql
-- 评论表
CREATE TABLE `comment` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `article_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `content` TEXT NOT NULL,
  `parent_id` BIGINT DEFAULT 0 COMMENT '父评论ID(支持回复)',
  `status` TINYINT DEFAULT 0 COMMENT '0-待审核 1-已通过 2-已驳回',
  `auditor_id` BIGINT,
  `audited_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_article` (`article_id`),
  INDEX `idx_status` (`status`)
);

-- 收藏表
CREATE TABLE `favorite` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `article_id` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_article` (`user_id`, `article_id`)
);
```

### 3.4 AI 抓取与系统配置

```sql
-- AI 抓取任务表
CREATE TABLE `crawl_task` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `keyword` VARCHAR(100) NOT NULL COMMENT '抓取关键词',
  `status` TINYINT DEFAULT 0 COMMENT '0-待执行 1-执行中 2-已完成 3-失败',
  `result_count` INT DEFAULT 0 COMMENT '抓取结果数',
  `error_message` VARCHAR(500),
  `trigger_type` VARCHAR(20) COMMENT 'MANUAL/AUTO',
  `created_by` BIGINT COMMENT '触发人(管理员)',
  `started_at` DATETIME,
  `completed_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI 抓取结果表（待审核文章草稿）
CREATE TABLE `crawl_result` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `task_id` BIGINT,
  `title` VARCHAR(200),
  `summary` VARCHAR(500),
  `content` LONGTEXT COMMENT 'AI清洗后的内容',
  `source_url` VARCHAR(500) COMMENT '原始来源URL',
  `source_name` VARCHAR(100) COMMENT '来源网站名',
  `category_id` BIGINT,
  `tags` VARCHAR(200),
  `cover_image` VARCHAR(500),
  `status` TINYINT DEFAULT 0 COMMENT '0-待审核 1-已转为文章 2-已废弃',
  `article_id` BIGINT COMMENT '审核通过后关联的文章ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 系统配置表
CREATE TABLE `system_config` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `config_key` VARCHAR(100) NOT NULL UNIQUE,
  `config_value` TEXT,
  `description` VARCHAR(255),
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 预置配置项
-- ai_enabled: true/false (AI功能总开关)
-- ai_provider: openai/dashscope/deepseek (AI服务商)
-- ai_api_key: xxx (API密钥)
-- ai_model: gpt-4o/qwen-max/deepseek-chat (模型名称)
-- crawl_schedule: 0 0 3 * * ? (定时抓取cron表达式)
-- daily_publish_limit: 1 (每日自动发布上限)
```

---

## 四、API 接口设计

### 4.1 公开接口（无需登录）

| 方法 | 路径                 | 说明                              |
| ---- | -------------------- | --------------------------------- |
| GET  | `/api/articles`      | 文章列表（分页、按分类/标签筛选） |
| GET  | `/api/articles/{id}` | 文章详情                          |
| GET  | `/api/categories`    | 分类列表                          |
| GET  | `/api/search?q=xxx`  | 全文搜索（ES）                    |
| POST | `/api/auth/login`    | 用户登录                          |
| POST | `/api/auth/register` | 用户注册                          |

### 4.2 用户接口（需登录）

| 方法 | 路径                          | 说明              |
| ---- | ----------------------------- | ----------------- |
| POST | `/api/articles/{id}/favorite` | 收藏/取消收藏文章 |
| GET  | `/api/favorites`              | 我的收藏列表      |
| POST | `/api/articles/{id}/comments` | 发表评论          |
| GET  | `/api/articles/{id}/comments` | 获取文章评论列表  |
| GET  | `/api/user/profile`           | 获取个人信息      |
| PUT  | `/api/user/profile`           | 更新个人信息      |

### 4.3 审核员接口

| 方法 | 路径                                    | 说明                   |
| ---- | --------------------------------------- | ---------------------- |
| GET  | `/api/admin/crawl-results`              | 待审核的AI抓取结果列表 |
| POST | `/api/admin/crawl-results/{id}/approve` | 审核通过（转为文章）   |
| POST | `/api/admin/crawl-results/{id}/reject`  | 审核驳回               |
| GET  | `/api/admin/comments/pending`           | 待审核评论列表         |
| POST | `/api/admin/comments/{id}/approve`      | 审核通过评论           |
| POST | `/api/admin/comments/{id}/reject`       | 驳回评论               |

### 4.4 管理员接口

| 方法                | 路径                                    | 说明                     |
| ------------------- | --------------------------------------- | ------------------------ |
| GET/POST/PUT/DELETE | `/api/admin/articles/**`                | 文章CRUD                 |
| GET/POST/PUT/DELETE | `/api/admin/categories/**`              | 分类管理                 |
| GET/POST/PUT/DELETE | `/api/admin/users/**`                   | 用户管理                 |
| GET/POST/PUT/DELETE | `/api/admin/roles/**`                   | 角色管理                 |
| GET/POST/PUT/DELETE | `/api/admin/permissions/**`             | 权限管理                 |
| POST                | `/api/admin/crawl/trigger`              | 手动触发AI抓取           |
| PUT                 | `/api/admin/crawl/schedule`             | 配置定时抓取             |
| GET/PUT             | `/api/admin/system-config`              | 系统配置管理             |
| POST                | `/api/admin/crawl-results/{id}/publish` | 手动将抓取结果发布为文章 |

---

## 五、AI 内容抓取与审核流程

### 5.1 整体流程

```
[定时触发/手动触发]
       ↓
[AI 全网搜索] → 搜索玉石相关关键词 → 获取网页内容
       ↓
[AI 内容清洗] → 提取核心信息 → 去重 → 重组为文章格式
       ↓
[存入 crawl_result 表] → 状态: 待审核
       ↓
[审核员审核] → 通过 → 转为正式文章 → 发布
              → 驳回 → 标记废弃
       ↓
[每日发布限制] → 每天最多自动发布 1 篇（可后台配置）
```

### 5.2 AI 抓取逻辑

1. **搜索阶段**：根据配置的关键词列表，调用搜索引擎 API 获取相关网页 URL。
2. **内容提取**：抓取网页正文内容。
3. **AI 清洗**：调用配置的大模型 API，对原始内容进行清洗、去重、重组，输出结构化的文章（标题、摘要、正文、标签、分类建议）。
4. **入库**：将清洗后的内容存入 `crawl_result` 表，状态为"待审核"。
5. **发布限制**：系统检查当天已发布数量，若达到上限则排队到次日。

### 5.3 后台配置项

管理员可在后台配置：

| 配置项        | 说明                                   |
| ------------- | -------------------------------------- |
| AI 功能开关   | 启用/禁用 AI 抓取功能                  |
| AI 服务商     | OpenAI / 通义千问 / DeepSeek 等        |
| API Key       | 对应服务商的密钥                       |
| 模型名称      | 如 gpt-4o、qwen-max 等                 |
| 抓取关键词    | 多个关键词，如"翡翠鉴别""和田玉收藏"等 |
| 定时抓取 Cron | 如每天凌晨 3 点执行                    |
| 每日发布上限  | 默认 1 篇                              |
| 抓取来源过滤  | 可选：仅特定域名 / 排除低质量站点      |

---

## 六、前端页面规划

### 6.1 前台页面（用户端）

| 页面        | 说明                                    |
| ----------- | --------------------------------------- |
| 首页        | 轮播推荐、最新文章、热门文章、分类导航  |
| 文章列表页  | 按分类/标签筛选，分页加载               |
| 文章详情页  | 正文展示、图片/视频、评论区域、收藏按钮 |
| 搜索页      | 搜索框 + ES 实时搜索结果，支持高亮      |
| 登录/注册页 | JWT 认证                                |
| 个人中心    | 我的收藏、我的评论、个人信息编辑        |

### 6.2 后台页面（管理端）

| 页面         | 说明                                 |
| ------------ | ------------------------------------ |
| 仪表盘       | 数据统计（文章数、用户数、评论数等） |
| 文章管理     | 文章列表、编辑、新建、上下架         |
| AI 抓取管理  | 抓取结果列表、审核操作、手动触发抓取 |
| 评论管理     | 待审核评论列表、审核操作             |
| 分类管理     | 分类 CRUD                            |
| 用户管理     | 用户列表、角色分配                   |
| 角色权限管理 | 角色 CRUD、权限分配                  |
| 系统配置     | AI 配置、抓取配置、发布限制等        |

---

## 七、开发环境与 Git 管理

### 7.1 本地开发环境

| 工具          | 版本要求 |
| ------------- | -------- |
| JDK           | 17+      |
| Node.js       | 20+      |
| MySQL         | 8.0+     |
| Elasticsearch | 8.x      |
| Redis         | 6.x+     |
| Maven         | 3.8+     |
| Git           | 最新版   |

### 7.2 项目初始化

```bash
# 克隆项目
git clone https://github.com/your-username/jade-knowledge.git
cd jade-knowledge

# 后端启动
cd backend
mvn spring-boot:run

# 前端启动
cd frontend
npm install
npm run dev
```

### 7.3 Git 分支策略

```
main        → 生产分支（稳定版本）
develop     → 开发主分支
feature/*   → 功能分支（如 feature/ai-crawl）
fix/*       → 修复分支
```

---

## 八、开发优先级建议

### Phase 1 - 基础框架（MVP）
- [ ] Spring Boot 项目搭建 + 数据库初始化
- [ ] Next.js 项目搭建 + 基础页面
- [ ] 用户注册/登录（JWT）
- [ ] 文章 CRUD（管理员）
- [ ] 文章列表/详情页（前台）
- [ ] 分类管理

### Phase 2 - 用户互动
- [ ] 评论功能（含审核流程）
- [ ] 收藏功能
- [ ] 个人中心
- [ ] 角色权限管理（Spring Security + RBAC）

### Phase 3 - 搜索
- [ ] Elasticsearch 集成
- [ ] 文章索引同步
- [ ] 前台搜索页（高亮、分页）

### Phase 4 - AI 功能
- [ ] Spring AI 集成
- [ ] AI 内容抓取与清洗
- [ ] 抓取结果审核流程
- [ ] 定时任务配置
- [ ] 后台系统配置页面

### Phase 5 - 媒体与优化
- [ ] 图片/视频上传与管理
- [ ] SEO 优化（SSR、meta 标签、sitemap）
- [ ] 移动端适配完善
- [ ] 性能优化

---

## 九、前端 UI 架构

### 9.1 主题系统

采用 CSS Custom Properties 实现主题切换，所有颜色通过 CSS 变量引用：

```css
/* globals.css */
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8F9FA;
  --bg-card: #FFFFFF;
  --text-primary: #1A1A1A;
  --text-secondary: #4A4A4A;
  --text-muted: #8A8A8A;
  --brand-primary: #10B981;
  /* ... */
}

[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1F2937;
  --bg-card: #1F2937;
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --text-muted: #9CA3AF;
  /* ... */
}
```

- 亮色主题：白色 (#FFFFFF) + 浅灰 (#F8F9FA) + 深色文字 (#1A1A1A)
- 暗色主题：深蓝灰 (#111827) + 浅深灰 (#1F2937) + 浅色文字 (#F9FAFB)
- 品牌色：翡翠绿 (#10B981)
- 切换方式：自动跟随系统 + 手动切换（太阳/月亮/电脑图标循环）
- FOWT 防止：`layout.tsx` 中内联 `<script>` 在 React 水合前设置 `data-theme`

### 9.2 后台布局结构

```
AdminLayout (flex h-screen overflow-hidden)
├── AdminSidebar (w-60 / w-16 折叠)
│   ├── 顶栏：Logo + 标题 + 折叠按钮
│   ├── 导航菜单（带活跃状态高亮）
│   └── 底部：用户信息 → 主题切换 → 退出
└── 主内容区 (flex-1 flex flex-col overflow-hidden)
    └── 每个页面
        ├── 顶栏 (flex-shrink-0)：图标 + 标题 + 操作按钮
        └── 内容区 (flex-1 overflow-y-auto)：表格/表单等
```

### 9.3 UI 组件规范

- **颜色**：全部通过 CSS 变量（`var(--bg-card)`、`var(--text-primary)` 等），不硬编码
- **焦点**：`focus:outline-none`，无 `focus:ring-*`、无 `box-shadow`
- **操作按钮**：图标-only `Button variant="ghost" size="sm"`，`w-3.5 h-3.5` 图标，`title` 属性提示
- **下拉框**：使用自定义 `Select` 组件，非原生 `<select>`
- **加载状态**：骨架屏（TableSkeleton），非 Spinner

---

## 十、关键注意事项

1. **CSS 变量一致性**：新增组件样式必须使用 CSS 变量，禁止硬编码颜色值，确保亮/暗主题兼容。
2. **ES 与 MySQL 数据同步**：文章发布/更新时，需同步更新 ES 索引；删除时同步删除。
3. **AI 抓取频率控制**：避免频繁调用 API 造成费用超支，建议设置每日调用上限。
4. **图片存储**：建议使用腾讯云 COS 或阿里云 OSS 存储图片/视频，避免直接存数据库。
5. **JWT 过期策略**：Access Token 有效期建议 2 小时，Refresh Token 有效期 7 天。
6. **评论防刷**：同一用户对同一文章短时间内多次评论需做限制。
7. **SEO**：Next.js 使用 SSR 模式，每篇文章生成独立的 meta 标签和结构化数据。
8. **Node.js 版本**：Next.js 16 要求 Node.js 20+，部署时需确认服务器版本。

---

文档到此完成！如果需要对某个部分做进一步细化，随时告诉我！
