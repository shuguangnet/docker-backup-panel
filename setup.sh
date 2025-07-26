#!/bin/bash

# Docker 备份管理系统 - 快速设置脚本

echo "🚀 开始设置 Docker 备份管理系统..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到 Node.js，请先安装 Node.js (版本 >= 18)"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未检测到 npm，请确保 npm 已正确安装"
    exit 1
fi

echo "✅ Node.js 环境检查通过"

# 安装根目录依赖
echo "📦 安装根目录依赖..."
npm install

# 进入后端目录并安装依赖
echo "📦 安装后端依赖..."
cd backend
npm install

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "⚙️ 创建后端环境变量文件..."
    cat > .env << EOF
# 应用配置
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# 数据库配置
DATABASE_URL="file:./data/backup.db"

# JWT 密钥
JWT_SECRET=docker_backup_panel_secret_key_change_in_production

# 管理员认证
ADMIN_PASSWORD=admin123

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# 备份配置
BACKUP_SCRIPT_PATH=/path/to/your/backup/script
BACKUP_LOG_PATH=/path/to/backup/logs
EOF
    echo "✅ 后端环境变量文件已创建"
else
    echo "⚠️ 后端环境变量文件已存在，跳过创建"
fi

# 创建数据目录
mkdir -p data uploads

# 初始化数据库
echo "🗄️ 初始化数据库..."
npx prisma generate
npx prisma db push

echo "✅ 后端设置完成"

# 返回根目录并设置前端
cd ..
echo "📦 安装前端依赖..."
cd frontend
npm install

echo "✅ 前端设置完成"

# 返回根目录
cd ..

echo ""
echo "🎉 设置完成！"
echo ""
echo "📋 使用说明："
echo "  1. 启动开发服务器: npm run dev"
echo "  2. 前端地址: http://localhost:5173"
echo "  3. 后端地址: http://localhost:3001"
echo "  4. 健康检查: http://localhost:3001/health"
echo ""
echo "🔧 其他命令："
echo "  - 只启动前端: npm run dev:frontend"
echo "  - 只启动后端: npm run dev:backend"
echo "  - 构建项目: npm run build"
echo "  - 查看数据库: cd backend && npm run db:studio"
echo ""
echo "📖 更多信息请查看 README.md"
echo ""

# 询问是否立即启动
read -p "是否立即启动开发服务器? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 启动开发服务器..."
    npm run dev
fi 