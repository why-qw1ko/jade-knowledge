# ============================================
# GitHub Actions CI/CD 配置指南
# ============================================

## 1. 推送代码到 GitHub

```bash
cd /path/to/jade-knowledge
git init
git add .
git commit -m "init: 玉石知识平台"
git remote add origin https://github.com/your-username/jade-knowledge.git
git push -u origin main
```

## 2. 配置 GitHub Secrets

进入 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret

添加以下 Secrets:

| Secret 名称 | 说明 | 示例 |
|-------------|------|------|
| `SERVER_HOST` | 服务器 IP 地址 | `123.45.67.89` |
| `SERVER_USER` | SSH 登录用户 | `root` |
| `SSH_KEY` | SSH 私钥（整个文件内容） | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_PORT` | SSH 端口（默认22可不填） | `22` |

### 获取 SSH 私钥

在你本地电脑执行：
```bash
# 如果没有密钥，生成一个
ssh-keygen -t ed25519 -C "deploy@jade-knowledge"

# 查看私钥（复制整个内容到 GitHub Secret）
cat ~/.ssh/id_ed25519

# 把公钥添加到服务器
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@你的服务器IP
```

## 3. 服务器环境准备

```bash
# 上传初始化脚本到服务器
scp scripts/server-init.sh root@你的服务器IP:/tmp/

# 在服务器上执行
ssh root@你的服务器IP
chmod +x /tmp/server-init.sh
/tmp/server-init.sh
```

## 4. 配置环境变量

在服务器上创建 `/www/wwwroot/jade-knowledge/.env`:

```bash
# 数据库
DB_PASSWORD=你的数据库密码

# Redis（如果有密码）
REDIS_PASSWORD=

# JWT 密钥（改成随机字符串）
JWT_SECRET=your-random-secret-key-here-change-this
```

## 5. 宝塔面板配置

1. **网站** → 添加站点 → 域名填你的域名 → 目录设为 `/www/wwwroot/jade-knowledge`
2. **网站** → 设置 → 配置文件 → 粘贴 `nginx.conf` 的内容
3. **网站** → 设置 → SSL → Let's Encrypt 一键申请（需要域名已解析）
4. **软件商店** → 确保已安装：Nginx、MySQL 8.0、Redis

## 6. 首次手动部署

```bash
# 在服务器上
cd /www/wwwroot/jade-knowledge

# 上传 schema.sql 并导入
mysql -u jade_user -p jade_knowledge < schema.sql

# 后端
nohup java -jar backend.jar --spring.profiles.active=prod > logs/backend.log 2>&1 &
echo $! > backend.pid

# 前端
cd frontend
pm2 start npm --name jade-frontend -- start
```

## 7. 测试 CI/CD

修改任意文件，push 到 main 分支，GitHub Actions 会自动：
1. 构建后端 JAR
2. 构建前端
3. SSH 部署到服务器
4. 重启服务

## 故障排查

```bash
# 查看后端日志
tail -f /www/wwwroot/jade-knowledge/backend.log

# 查看前端日志
pm2 logs jade-frontend

# 查看 Nginx 日志
tail -f /www/wwwlogs/jade-knowledge.log

# 检查服务状态
pm2 status
ps aux | grep java
```
