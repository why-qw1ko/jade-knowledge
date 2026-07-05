# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

玉石知识内容平台 (Jade Knowledge) — a content platform for jade/翡翠 enthusiasts with articles, comments, favorites, search, and an AI-powered content crawl system.

## Common Commands

### Backend (Spring Boot 3.x, JDK 17+)
```bash
cd backend
mvn spring-boot:run                    # Start dev server on :8080
mvn clean package -DskipTests -q       # Build JAR
mvn test                               # Run tests
```

### Frontend (Next.js 16, Node.js 20+)
```bash
cd frontend
npm install                            # Install dependencies
npm run dev                            # Start dev server on :3000
npm run build                          # Production build
npm run lint                           # ESLint
```

### Database
```bash
mysql -u root -p jade_knowledge < backend/src/main/resources/db/schema.sql
```

Default admin credentials: `admin` / `admin123` (BCrypt in schema.sql).

## Architecture

Monorepo with two independent apps:

### Backend (`backend/`)
Spring Boot 3.2 + MyBatis-Plus + Spring Security + JWT (RBAC).

- **Entry point**: `com.jade.JadeKnowledgeApplication` (`@MapperScan("com.jade.mapper")`, `@EnableScheduling`)
- **Package structure**:
  - `controller/` — REST endpoints; `controller/admin/` — admin-only endpoints (require `ROLE_ADMIN`)
  - `service/` + `service/impl/` — business logic (interface/impl pattern)
  - `mapper/` — MyBatis-Plus mapper interfaces (auto-injected CRUD)
  - `model/entity/` — DB entities (`@TableName`, `@TableId`, `@TableLogic` for soft delete): User, Article, Category, Comment, Favorite, Role, UserRole, Permission, RolePermission, Banner, Announcement, CrawlResult, CrawlTask, SystemConfig
  - `model/dto/` — request DTOs (validated with `@Valid`)
  - `model/vo/` — response view objects
  - `security/` — JWT filter, `JwtUtils`, `LoginUser` (implements `UserDetails`), `UserDetailsServiceImpl`
  - `config/` — `SecurityConfig`, `CorsConfig`, `MyBatisPlusConfig`, `RedisConfig`
  - `common/` — `Result<T>` (unified response wrapper), `GlobalExceptionHandler`, `BusinessException`
- **Auth flow**: `JwtAuthenticationFilter` runs before `UsernamePasswordAuthenticationFilter`. White-listed paths (`/api/auth/**`, `/api/articles/**`, `/api/categories/**`, `/api/search/**`, `/api/banners/**`, `/api/announcements/**`, `/upload/**`) skip JWT validation. For other paths, the JWT token is parsed and `SecurityContextHolder` is populated with `LoginUser` + authorities.
- **Response format**: All endpoints return `Result<T>` with `{code, message, data}`.
- **Config profiles**: `application.yml` (base), `application-dev.yml` (local), `application-prod.yml` (production). Active profile defaults to `prod`. JWT properties must use `jwt.access-expire` and `jwt.refresh-expire` (in seconds).
- **Soft delete**: Entities with `@TableLogic` field `deleted` (0=active, 1=deleted). MyBatis-Plus auto-rewrites queries.
- **Lombok**: Entities, DTOs, and services use `@Data`, `@RequiredArgsConstructor` extensively.

### Frontend (`frontend/`)
Next.js 16 (App Router) + Tailwind CSS v4 + Zustand + Axios.

- **Path alias**: `@/*` → `./src/*`
- **Pages** (`src/app/`):
  - `/` — home (banner carousel + announcement marquee + categories + hot articles + latest articles)
  - `/articles` — list, `/articles/[id]` — detail
  - `/announcements` — announcement list page
  - `/login`, `/register`, `/profile` — auth pages (profile supports avatar upload)
  - `/admin/*` — admin dashboard (guarded by `AdminLayout` which checks `isAdmin()`)
  - `/search` — search page
- **State management**: `src/store/authStore.ts` (Zustand) — auth state; `src/store/appStore.ts` — theme state (`light` | `dark` | `system`).
- **Theme system**: CSS custom properties defined in `globals.css` (`--bg-primary`, `--bg-card`, `--text-primary`, `--brand-primary`, etc.). Dark mode via `[data-theme="dark"]` selector with `!important` overrides on Tailwind utility classes. FOWT (flash of wrong theme) prevented by inline `<script>` in `layout.tsx` that sets `data-theme` before React hydration. Theme persisted in `localStorage`, follows system preference when set to `system`.
- **API layer**: `src/lib/api.ts` — Axios instance with:
  - Base URL: `NEXT_PUBLIC_API_URL` env var or `http://localhost:8080`
  - Request interceptor: attaches `Bearer` token from `localStorage`
  - Response interceptor: unwraps `response.data` on success; on 401, clears token and redirects to `/login`
  - Exports: `authApi`, `articlesApi`, `categoriesApi`, `searchApi`, `userApi` (includes `uploadAvatar`), `favoritesApi`, `commentsApi`, `announcementsApi`, `bannersApi`, `adminApi`, `uploadApi`
  - Helper: `resolveImageUrl(url)` — prepends API_BASE to relative image paths
- **Token storage**: `localStorage` key `token`. JWT expiry checked client-side via `atob` decode in `src/lib/auth.ts`.
- **UI components**: Custom components in `src/components/ui/` (Button, Card, Input, Select, Modal, Badge, Pagination, Toast, Loading). Style via CSS custom properties, not Tailwind config.
- **Layout pattern**: Admin pages use fixed header + scrollable content: `flex flex-col h-full overflow-hidden` wrapper → `flex-shrink-0` header → `flex-1 overflow-y-auto min-h-0` content area.
- **Icons**: `lucide-react`

## Key Conventions

- Backend entity IDs are `Long` (BIGINT auto-increment).
- Role codes: `ADMIN`, `AUDITOR`, `USER`. Roles are prefixed with `ROLE_` when set as Spring Security authorities.
- Frontend API calls go through `src/lib/api.ts` exports (`authApi`, `articlesApi`, `adminApi`, etc.) — never raw `axios`.
- Admin API paths are under `/api/admin/**` and require `ROLE_ADMIN`.
- Comments and crawl results have an audit workflow (status 0=pending, 1=approved, 2=rejected).
- Announcements have types: 0=普通, 1=重要, 2=紧急; status: 0=草稿, 1=已发布, 2=已下线.
- Banners are configurable via system config (`banner_enabled` = `true`/`false`).
- User avatar upload: `POST /api/user/avatar` (requires auth, saves to `/uploads/avatars/` directory).
- Article default cover: `/upload/default.png` (set in DB via `COALESCE(NULLIF(cover_image, ''), '/upload/default.png')`).

### Frontend UI Conventions

- **Theme-aware styling**: Use CSS custom properties (`var(--bg-card)`, `var(--text-primary)`, etc.) for all colors. Never hardcode `#FFF` / `#000` / Tailwind color classes directly — map them through the CSS variable system so dark mode works.
- **No focus rings**: Buttons, inputs, selects use `focus:outline-none` only. No `focus:ring-*` or `box-shadow` on focus.
- **Header layout**: Desktop right section order: nav links → login button (if not authenticated) → theme toggle → user icon (if authenticated). User icon shows avatar image if available, otherwise User icon. Click opens dropdown with user info header (large avatar + nickname). No register button in header (register only from login page).
- **Homepage sections**: Banner carousel (configurable) → Announcement marquee → Categories → Hot articles → Latest articles. Hero section uses `heroLoaded` state to prevent flash of wrong content.
- **Content width**: All major sections use `max-w-7xl mx-auto` for consistent width. Announcement marquee has its own background within this width constraint.
- **Article detail page**:
  - Content rendering: supports both Markdown and HTML formats via `contentFormat` field
  - Markdown uses `ReactMarkdown` with plugins: `remarkGfm`, `rehypeRaw`, `rehypeSanitize`, `rehypeSlug`
  - HTML uses `dangerouslySetInnerHTML` with id injection for TOC
  - TOC (Table of Contents): auto-extracts headings, supports click-to-scroll and scroll-highlight
  - TOC ID generation: uses `textToSlug()` function matching `rehype-slug` output format
  - Scroll offset: 88px (72px header + 16px spacing) for accurate anchor positioning
  - Article content styles: defined in `src/styles/article-content.css` with first-line indent, rich typography
  - Summary auto-extraction: backend extracts first 200 chars if not provided
- **Admin page structure**: Each admin page follows the pattern:
  ```
  div.flex.flex-col.h-full.p-4.overflow-hidden
    div.flex-shrink-0.mb-6        ← title row (icon + title + action buttons)
    div.flex-1.overflow-y-auto    ← content area (tables, forms, etc.)
  ```
- **Action buttons**: Table actions use icon-only `Button variant="ghost" size="sm"` with `title` attribute for tooltip. Icons are `w-3.5 h-3.5`. Common: `Edit2` (edit), `Trash2` (delete), `CheckCircle` (approve), `XCircle` (reject).
- **Custom Select**: Native `<select>` is replaced by `src/components/ui/Select.tsx` — a custom dropdown built with `useState`/`useRef` for proper theme styling.
- **Admin sidebar**: Collapsible (`w-60` → `w-16`). Top: logo (expanded) or PanelLeftOpen icon (collapsed). Bottom: user info → divider → 返回前台 link → theme toggle (sun/moon/monitor cycle) → logout.

## Deployment

- GitHub Actions CI/CD (`.github/workflows/deploy.yml`): builds backend JAR + frontend, SCPs to server, restarts via SSH.
- Production runs on a remote server with Nginx reverse proxy, PM2 for frontend, `java -jar` for backend.
- Server env vars in `/www/wwwroot/jade-knowledge/.env`: `DB_PASSWORD`, `REDIS_PASSWORD`, `JWT_SECRET`.

## API Documentation

Swagger UI available at `http://localhost:8080/swagger-ui.html` when backend is running.

## 注意事项

- PowerShell 不支持 `&&` 命令链式调用，使用 `;` 代替。正确写法: `cd "path"; npm run build`
- 前端图片路径处理: 后端返回相对路径（如 `/upload/xxx.jpg`），前端需使用 `resolveImageUrl()` 转换为完整 URL
- 首页轮播图根据系统配置 `banner_enabled` 决定是否显示，使用 `heroLoaded` 状态防止内容闪烁
- 个人中心支持头像上传，后端接口 `POST /api/user/avatar`，文件保存到 `/uploads/avatars/` 目录
- 公告类型: 0=普通(蓝色), 1=重要(黄色), 2=紧急(红色)
- 文章删除前会检查关联的评论和收藏，用户删除前会检查关联的文章和评论
- AI生成文章提示词要求段落首行加全角空格缩进，摘要以「摘要：」标记
- 文章摘要自动提取: 优先提取「摘要：」标记后内容，否则提取正文前200字
- 文章详情页TOC使用 `rehype-slug` 插件生成标题id，格式为文本slug（中文保留）
- 评论管理支持编辑内容，后端接口 `PUT /api/admin/comments/{id}`