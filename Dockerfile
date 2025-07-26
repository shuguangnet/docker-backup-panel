# 多阶段构建 Dockerfile
FROM node:18 AS builder

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 复制所有 package.json 文件
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# 清理 npm 缓存并安装依赖
RUN npm cache clean --force
RUN npm ci --verbose

# 复制源代码
COPY . .

# 清理并重新安装依赖以解决 Rollup 原生依赖问题
RUN cd frontend && \
    rm -rf node_modules package-lock.json && \
    npm install && \
    cd ..

RUN cd backend && \
    rm -rf node_modules package-lock.json && \
    npm install && \
    cd ..

# 分别构建前端和后端，添加详细日志
RUN echo "开始构建前端..." && \
    cd frontend && \
    npm run build --verbose && \
    echo "前端构建完成" && \
    cd ..

RUN echo "开始构建后端..." && \
    cd backend && \
    npm run build --verbose && \
    echo "后端构建完成"

# 生产阶段
FROM node:18-alpine AS production

WORKDIR /app

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 复制 package.json 文件
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# 只安装生产依赖
RUN npm ci --only=production --verbose

# 复制构建产物
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/dist ./backend/dist

# 复制必要的配置文件
COPY backend/prisma ./backend/prisma

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 更改文件所有权
RUN chown -R nextjs:nodejs /app
USER nextjs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# 启动命令
CMD ["node", "backend/dist/server.js"]