# 玉石知识内容平台 (Jade Knowledge)

中型玉石知识内容平台，面向玉石爱好者提供翡翠、和田玉、碧玺、岫玉等品类的鉴别知识、收藏经验与文化科普内容。

## 技术栈

### 后端
- **框架**: Spring Boot 3.x
- **权限**: Spring Security + JWT (RBAC)
- **AI**: Spring AI (支持 OpenAI / 通义千问 / DeepSeek)
- **ORM**: MyBatis-Plus
- **搜索**: Elasticsearch
- **数据库**: MySQL 8.0+
- **缓存**: Redis
- **文档**: SpringDoc OpenAPI

### 前端
- **框架**: Next.js 14+ (App Router)
- **UI**: Tailwind CSS + shadcn/ui 风格组件
- **状态管理**: Zustand
- **HTTP**: Axios
- **富文本**: TipTap

## 快速开始

### 环境要求
- JDK 17+
- Node.js 18+
- MySQL 8.0+
- Redis 6.x+
- Elasticsearch 8.x (可选，Phase 3 启用)

### 后端启动

```bash
cd backend

# 创建数据库
mysql -u root -p -e "CREATE DATABASE jade_knowledge DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入表结构
mysql -u root -p jade_knowledge < src/main/resources/db/schema.sql

# 启动
mvn spring-boot:run
```

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
├── backend/          # Spring Boot 后端
├── frontend/         # Next.js 前端
├── docs/             # 项目文档
└── README.md
```

## 开发阶段

- [x] Phase 1 - 基础框架 (MVP)
- [ ] Phase 2 - 用户互动
- [ ] Phase 3 - 搜索
- [ ] Phase 4 - AI 功能
- [ ] Phase 5 - 媒体与优化

## API 文档

启动后端后访问: http://localhost:8080/swagger-ui.html
