# 多阶段构建 Dockerfile
FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 复制 package.json 文件
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# 安装依赖
# 修改安装命令，确保在正确的目录中安装依赖
RUN npm ci --only=production && \
    cd frontend && npm ci --only=production && \
    cd /app/backend && npm ci --only=production

# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制所有源代码
COPY . .

# 安装所有依赖（包括开发依赖）
RUN npm ci && \
    cd frontend && npm ci && \
    cd ../backend && npm ci

# 构建前端
RUN cd frontend && npm run build

# 构建后端
RUN cd backend && npm run build

# 生产阶段
FROM node:18-alpine AS production

WORKDIR /app

# 安装生产依赖
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/frontend/node_modules ./frontend/node_modules
COPY --from=base /app/backend/node_modules ./backend/node_modules

# 复制构建产物
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/dist ./backend/dist

# 复制必要的配置文件
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
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