#!/bin/bash

echo "🚀 启动 Docker 备份管理系统开发环境..."

# 检查后端是否已经运行
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "📦 启动后端服务器..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # 等待后端启动
    echo "⏳ 等待后端服务器启动..."
    sleep 5
else
    echo "✅ 后端服务器已在运行"
fi

# 启动前端
echo "📦 启动前端服务器..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 开发环境已启动！"
echo "📱 前端: http://localhost:5173"
echo "🔧 后端: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait 