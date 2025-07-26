# Docker Backup Panel

Docker 备份脚本可视化管理系统，提供友好的 Web 界面来管理和监控 Docker 容器备份。

## 技术栈

### 前端
- React 18
- TypeScript
- Less CSS
- ahooks
- lodash
- Vite

### 后端
- Express
- TypeScript
- SQLite
- Prisma ORM

## 项目结构

```
docker-backup-panel/
├── frontend/          # React 前端应用
├── backend/           # Express 后端 API
├── package.json       # 根项目配置
└── README.md
```

## 快速开始

### 安装依赖
```bash
npm run install:all
```

### 开发模式
```bash
npm run dev
```

这将同时启动前端和后端开发服务器：
- 前端: http://localhost:5173
- 后端: http://localhost:3001

### 构建生产版本
```bash
npm run build
```

## 功能特性

- 📊 Docker 备份任务监控面板
- 📝 备份日志查看和搜索
- ⚙️ 备份配置管理
- 🔔 备份状态通知
- 📈 备份统计分析

## 开发规范

- 组件文件名使用 PascalCase
- 样式文件使用 `.module.less`
- 使用 TypeScript 提供类型安全
- 使用 ahooks 处理副作用和事件监听
- 使用 lodash 提供工具函数 