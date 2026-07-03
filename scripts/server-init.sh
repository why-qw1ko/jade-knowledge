#!/bin/bash
# ============================================
# 玉石知识平台 - 服务器初始化脚本
# 适用于: 腾讯云 + 宝塔面板
# ============================================

set -e

echo "🚀 开始初始化服务器环境..."

# ---------- 1. 安装 JDK 17 ----------
echo "📦 安装 JDK 17..."
if ! java -version 2>&1 | grep -q "17"; then
    apt update -y
    apt install -y openjdk-17-jdk
    echo "✅ JDK 17 安装完成"
else
    echo "✅ JDK 17 已安装"
fi

# ---------- 2. 安装 Node.js 18 ----------
echo "📦 安装 Node.js 18..."
if ! node -v 2>&1 | grep -q "18"; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    echo "✅ Node.js 18 安装完成"
else
    echo "✅ Node.js 18 已安装"
fi

# ---------- 3. 安装 PM2 ----------
echo "📦 安装 PM2..."
npm install -g pm2 2>/dev/null || true

# ---------- 4. 创建项目目录 ----------
echo "📁 创建项目目录..."
mkdir -p /www/wwwroot/jade-knowledge
mkdir -p /www/wwwroot/jade-knowledge/logs

# ---------- 5. 创建数据库 ----------
echo "🗄️ 创建数据库..."
echo "请手动执行以下 SQL（输入你的 MySQL root 密码）:"
echo ""
echo "  mysql -u root -p"
echo "  CREATE DATABASE jade_knowledge DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "  CREATE USER 'jade_user'@'localhost' IDENTIFIED BY 'your_password';"
echo "  GRANT ALL PRIVILEGES ON jade_knowledge.* TO 'jade_user'@'localhost';"
echo "  FLUSH PRIVILEGES;"
echo "  USE jade_knowledge;"
echo "  SOURCE /www/wwwroot/jade-knowledge/schema.sql;"
echo ""

# ---------- 6. 安装 Redis ----------
echo "📦 检查 Redis..."
if ! command -v redis-cli &>/dev/null; then
    apt install -y redis-server
    systemctl enable redis-server
    systemctl start redis-server
    echo "✅ Redis 安装完成"
else
    echo "✅ Redis 已安装"
fi

# ---------- 7. 配置 Nginx (宝塔会管理) ----------
echo "🌐 Nginx 配置已准备，请在宝塔面板中添加站点"

echo ""
echo "=========================================="
echo "✅ 服务器初始化完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 在宝塔面板创建站点: jade-knowledge.com"
echo "2. 配置 Nginx（见 nginx.conf）"
echo "3. 在 GitHub 配置 Secrets"
echo "4. 推送代码触发部署"
