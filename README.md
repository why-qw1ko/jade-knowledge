# 玉石知识内容平台 (Jade Knowledge)

中型玉石知识内容平台，面向玉石爱好者提供翡翠、和田玉、碧玺、岫玉等品类的鉴别知识、收藏经验与文化科普内容。

## 功能特性

### 用户端
- 📰 **文章浏览** — 分类筛选、热门推荐、最新发布
- 🔍 **全文搜索** — Elasticsearch 驱动，支持中英文搜索
- 💬 **评论互动** — 文章评论、审核机制
- ⭐ **收藏功能** — 收藏/取消收藏文章
- 🔔 **公告通知** — 普通/重要/紧急三级公告，跑马灯展示
- 🎠 **轮播横幅** — 首页 Banner 轮播，后台可配置开关
- 🌗 **主题切换** — 亮色/暗色/跟随系统，一键切换
- 👤 **个人中心** — 头像上传、资料编辑

### 管理后台
- 📊 **数据看板** — 用户/文章/评论/爬取统计
- 📝 **文章管理** — 富文本/Markdown 编辑器，封面上传
- 📂 **分类管理** — 文章分类 CRUD
- 💬 **评论审核** — 评论审批/驳回/编辑
- 👥 **用户管理** — 用户列表、角色分配
- 🔐 **权限管理** — RBAC 角色权限体系
- 🕷️ **内容爬取** — AI 驱动的内容采集与自动发布
- 📢 **公告管理** — 公告发布/下线
- 🖼️ **横幅管理** — Banner 轮播图配置

## 技术栈

### 后端
- **框架**: Spring Boot 3.x + JDK 17
- **权限**: Spring Security + JWT (RBAC)
- **ORM**: MyBatis-Plus
- **数据库**: MySQL 8.0+
- **缓存**: Redis
- **搜索**: Elasticsearch 8.x
- **AI**: LLM 集成（内容爬取/生成）
- **文档**: SpringDoc OpenAPI (Swagger)

### 前端
- **框架**: Next.js 16 (App Router) + React 19
- **样式**: Tailwind CSS v4 + CSS Custom Properties 主题系统
- **状态管理**: Zustand
- **HTTP**: Axios
- **编辑器**: TipTap (富文本) + Markdown 编辑器
- **图标**: Lucide React

## 快速开始

### 环境要求
- JDK 17+
- Node.js 20+
- MySQL 8.0+
- Redis 6.x+
- Elasticsearch 8.x (可选，搜索降级为数据库 LIKE)

### 后端启动

```bash
cd backend

# 创建数据库
mysql -u root -p -e "CREATE DATABASE jade_knowledge DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入表结构和初始数据
mysql -u root -p jade_knowledge < src/main/resources/db/schema.sql

# 配置数据库连接 (application-dev.yml)
# 启动
mvn spring-boot:run
```

默认管理员账号: `admin` / `admin123`

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
jade-knowledge/
├── backend/                          # Spring Boot 后端
│   └── src/main/java/com/jade/
│       ├── controller/               # REST 接口
│       │   └── admin/                # 管理后台接口
│       ├── service/                  # 业务逻辑
│       │   └── impl/
│       ├── mapper/                   # MyBatis-Plus Mapper
│       ├── model/
│       │   ├── entity/               # 数据库实体
│       │   ├── dto/                  # 请求 DTO
│       │   └── vo/                   # 响应 VO
│       ├── security/                 # JWT 认证
│       ├── config/                   # 配置类
│       └── ai/                       # AI 集成
├── frontend/                         # Next.js 前端
│   └── src/
│       ├── app/                      # 页面路由
│       │   ├── admin/                # 管理后台页面
│       │   ├── articles/             # 文章页面
│       │   └── ...
│       ├── components/               # 组件
│       │   ├── ui/                   # 通用 UI 组件
│       │   ├── admin/                # 管理后台组件
│       │   ├── article/              # 文章组件
│       │   ├── comment/              # 评论组件
│       │   └── layout/               # 布局组件
│       ├── lib/                      # 工具函数/API
│       ├── store/                    # Zustand 状态管理
│       └── styles/                   # 全局样式
└── README.md
```

## API 文档

启动后端后访问 Swagger UI: http://localhost:8080/swagger-ui.html

## 部署

项目支持 GitHub Actions CI/CD 自动部署：

1. 后端打包为 JAR，前端执行 `npm run build`
2. 通过 SCP 传输至服务器
3. Nginx 反向代理 + PM2 管理前端进程 + `java -jar` 运行后端

## License

MIT
