# 多阶段构建 Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制根目录和子项目的 package.json
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# 使用 workspaces 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建前端和后端
RUN npm run build

# 生产阶段
FROM node:18-alpine AS production

WORKDIR /app

# 复制 package.json 文件
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# 只安装生产依赖
RUN npm ci --only=production

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