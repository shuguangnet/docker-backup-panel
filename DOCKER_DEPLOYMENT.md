# Docker 部署指南

本文档介绍如何使用 Docker 部署 Docker 备份管理系统。

## 快速开始

### 1. 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 1GB 可用内存
- 至少 10GB 可用磁盘空间

### 2. 配置环境变量

复制环境变量示例文件并编辑：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置必要的环境变量：

```env
# Docker Hub 配置
DOCKERHUB_USERNAME=yourusername
DOCKERHUB_TOKEN=your-dockerhub-token

# 应用配置
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://localhost:3001

# 数据库配置
DATABASE_URL=file:./data/backup.db

# Redis 配置（可选）
REDIS_PASSWORD=your-redis-password

# 日志配置
LOG_LEVEL=info

# 备份配置
BACKUP_PATH=/app/backups
RETENTION_DAYS=30
MAX_CONCURRENT_BACKUPS=3

# 通知配置
NOTIFICATION_EMAIL=admin@example.com
AUTO_CLEANUP=true
```

### 3. 使用部署脚本

#### 开发环境部署

```bash
./deploy.sh dev
```

#### 生产环境部署

```bash
./deploy.sh prod
```

#### 查看服务状态

```bash
./deploy.sh status
```

#### 查看服务日志

```bash
./deploy.sh logs
```

### 4. 手动部署

#### 使用 docker-compose

```bash
# 开发环境
docker-compose up -d

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

#### 使用 Docker 命令

```bash
# 拉取镜像
docker pull yourusername/docker_backup_panel:latest

# 运行容器
docker run -d \
  --name docker-backup-panel \
  -p 3001:3001 \
  -v $(pwd)/data:/app/backend/data \
  -v $(pwd)/backups:/app/backups \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -e NODE_ENV=production \
  -e DATABASE_URL=file:./data/backup.db \
  yourusername/docker_backup_panel:latest
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `DOCKERHUB_USERNAME` | Docker Hub 用户名 | - | 是 |
| `DOCKERHUB_TOKEN` | Docker Hub 访问令牌 | - | 是 |
| `NODE_ENV` | 运行环境 | production | 否 |
| `PORT` | 服务端口 | 3001 | 否 |
| `JWT_SECRET` | JWT 密钥 | - | 是 |
| `CORS_ORIGIN` | CORS 允许的源 | http://localhost:3001 | 否 |
| `DATABASE_URL` | 数据库连接字符串 | file:./data/backup.db | 否 |
| `REDIS_PASSWORD` | Redis 密码 | - | 否 |
| `LOG_LEVEL` | 日志级别 | info | 否 |
| `BACKUP_PATH` | 备份存储路径 | /app/backups | 否 |
| `RETENTION_DAYS` | 备份保留天数 | 30 | 否 |
| `MAX_CONCURRENT_BACKUPS` | 最大并发备份数 | 3 | 否 |
| `NOTIFICATION_EMAIL` | 通知邮箱 | - | 否 |
| `AUTO_CLEANUP` | 自动清理过期备份 | true | 否 |

### 端口映射

| 容器端口 | 主机端口 | 说明 |
|----------|----------|------|
| 3001 | 3001 | 应用服务端口 |
| 80 | 80 | HTTP 端口（Nginx） |
| 443 | 443 | HTTPS 端口（Nginx） |

### 数据卷

| 主机路径 | 容器路径 | 说明 |
|----------|----------|------|
| `./data` | `/app/backend/data` | 数据库文件 |
| `./backups` | `/app/backups` | 备份文件 |
| `/var/run/docker.sock` | `/var/run/docker.sock` | Docker 套接字 |

## 网络配置

### 开发环境

- 应用直接暴露在 3001 端口
- 无 SSL 加密
- 适合本地开发和测试

### 生产环境

- 使用 Nginx 反向代理
- 支持 SSL/HTTPS
- 包含安全头配置
- 支持静态资源缓存

## 监控和日志

### 健康检查

应用提供健康检查端点：

```bash
curl http://localhost:3001/health
```

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs docker-backup-panel

# 实时查看日志
docker-compose logs -f
```

### 监控指标

- 容器资源使用情况
- 应用响应时间
- 错误率统计
- 备份任务状态

## 备份和恢复

### 数据备份

```bash
# 备份数据库
docker exec docker-backup-panel cp /app/backend/data/backup.db /app/backups/backup-$(date +%Y%m%d).db

# 备份配置文件
tar -czf config-backup-$(date +%Y%m%d).tar.gz .env docker-compose*.yml
```

### 数据恢复

```bash
# 恢复数据库
docker exec docker-backup-panel cp /app/backups/backup-20231201.db /app/backend/data/backup.db

# 重启服务
docker-compose restart
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口使用情况
   lsof -i :3001
   
   # 停止占用端口的进程
   sudo kill -9 <PID>
   ```

2. **权限问题**
   ```bash
   # 修复数据目录权限
   sudo chown -R $USER:$USER data backups
   ```

3. **镜像拉取失败**
   ```bash
   # 检查网络连接
   docker pull hello-world
   
   # 配置镜像加速器
   # 在 /etc/docker/daemon.json 中添加
   {
     "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]
   }
   ```

4. **服务启动失败**
   ```bash
   # 查看详细错误信息
   docker-compose logs docker-backup-panel
   
   # 检查环境变量
   docker-compose config
   ```

### 性能优化

1. **资源限制**
   ```yaml
   deploy:
     resources:
       limits:
         memory: 512M
         cpus: '0.5'
   ```

2. **缓存配置**
   ```yaml
   # 使用 Docker 构建缓存
   cache_from: type=gha
   cache_to: type=gha,mode=max
   ```

3. **日志轮转**
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

## 安全建议

1. **更改默认密码**
   - 修改 JWT_SECRET
   - 设置强密码

2. **网络安全**
   - 使用 HTTPS
   - 配置防火墙
   - 限制访问 IP

3. **容器安全**
   - 使用非 root 用户
   - 定期更新镜像
   - 扫描安全漏洞

4. **数据安全**
   - 加密敏感数据
   - 定期备份
   - 访问控制

## 更新和升级

### 自动更新

使用 GitHub Actions 自动构建和发布：

```bash
# 创建新版本标签
git tag v1.0.1
git push origin v1.0.1
```

### 手动更新

```bash
# 拉取最新镜像
docker pull yourusername/docker_backup_panel:latest

# 重启服务
docker-compose down
docker-compose up -d
```

## 支持

如果遇到问题，请：

1. 查看日志文件
2. 检查环境配置
3. 参考故障排除部分
4. 提交 Issue 到 GitHub

## 许可证

本项目采用 MIT 许可证。 