# Docker 备份管理系统 - 前端

基于 React + TypeScript + shadcn/ui 构建的现代化 Docker 备份管理前端应用。

## 技术栈

- **React 18** - 用户界面库
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **shadcn/ui** - 现代化 UI 组件库
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库
- **React Query** - 数据获取和缓存
- **React Router** - 路由管理
- **ahooks** - React Hooks 库
- **lodash** - 工具函数库
- **dayjs** - 日期处理

## 项目结构

```
src/
├── components/          # 组件目录
│   ├── ui/             # shadcn/ui 基础组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   └── table.tsx
│   └── Layout/         # 布局组件
│       └── MainLayout.tsx
├── pages/              # 页面组件
│   ├── Dashboard/      # 仪表盘
│   ├── Tasks/          # 任务管理
│   ├── Logs/           # 日志管理
│   └── Settings/       # 系统设置
├── lib/                # 工具函数
│   └── utils.ts
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## 主要功能

### 1. 仪表盘 (Dashboard)
- 系统运行状态概览
- 备份任务统计
- 成功率可视化
- 最近备份记录

### 2. 任务管理 (Tasks)
- 备份任务列表
- 任务状态管理
- 创建/编辑/删除任务
- 手动执行备份

### 3. 日志管理 (Logs)
- 备份执行日志
- 详细状态信息
- 错误信息查看
- 文件大小和路径

### 4. 系统设置 (Settings)
- 备份路径配置
- 保留策略设置
- 并发数限制
- 通知配置

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
npm run lint:fix
```

## 组件使用

### shadcn/ui 组件

项目使用 shadcn/ui 作为主要 UI 组件库，提供了现代化的设计系统：

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>标题</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>按钮</Button>
      </CardContent>
    </Card>
  );
}
```

### 图标使用

使用 Lucide React 图标库：

```tsx
import { Database, Settings, FileText } from 'lucide-react';

function IconExample() {
  return (
    <div>
      <Database className="h-4 w-4" />
      <Settings className="h-5 w-5" />
      <FileText className="h-6 w-6" />
    </div>
  );
}
```

## 样式指南

### Tailwind CSS

项目使用 Tailwind CSS 进行样式管理：

```tsx
// 响应式布局
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// 状态样式
<Badge variant="destructive">失败</Badge>
<Badge variant="default">成功</Badge>

// 间距和布局
<div className="p-6 space-y-6">
```

### 主题定制

通过 CSS 变量定制主题：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}
```

## API 集成

### React Query

使用 React Query 进行数据获取和缓存：

```tsx
import { useQuery } from 'react-query';

function TaskList() {
  const { data: tasks, isLoading } = useQuery(
    'backup-tasks',
    () => fetch('/api/tasks').then(res => res.json())
  );

  if (isLoading) return <div>加载中...</div>;
  
  return (
    <div>
      {tasks?.map(task => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

## 部署

### 构建

```bash
npm run build
```

### 静态文件部署

构建后的文件位于 `dist/` 目录，可以部署到任何静态文件服务器。

### 环境变量

创建 `.env` 文件配置环境变量：

```env
VITE_API_BASE_URL=http://localhost:3001
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License 