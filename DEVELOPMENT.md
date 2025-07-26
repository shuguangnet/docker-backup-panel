# 开发指南

## 项目架构

### 技术栈
- **前端**: React 18 + TypeScript + Vite + Antd + Less
- **后端**: Express + TypeScript + Prisma + SQLite
- **工具库**: ahooks + lodash + dayjs + react-query

### 目录结构
```
docker-backup-panel/
├── frontend/                 # React 前端应用
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   ├── pages/           # 页面组件
│   │   ├── utils/           # 工具函数
│   │   ├── hooks/           # 自定义 hooks
│   │   ├── types/           # TypeScript 类型定义
│   │   └── styles/          # 全局样式
│   ├── public/              # 静态资源
│   └── package.json
├── backend/                 # Express 后端 API
│   ├── src/
│   │   ├── routes/          # API 路由
│   │   ├── middleware/      # 中间件
│   │   ├── utils/           # 工具函数
│   │   └── types/           # TypeScript 类型定义
│   ├── prisma/              # 数据库模型和迁移
│   │   └── schema.prisma    # 数据库模式
│   ├── data/                # SQLite 数据库文件
│   └── package.json
└── setup.sh                # 快速设置脚本
```

## 快速开始

### 方式一: 使用设置脚本 (推荐)
```bash
./setup.sh
```

### 方式二: 手动设置
```bash
# 1. 安装依赖
npm run install:all

# 2. 设置后端环境变量
cd backend
cp .env.example .env  # 编辑配置

# 3. 初始化数据库
npm run db:generate
npm run db:push

# 4. 启动开发服务器
cd ..
npm run dev
```

## 开发规范

### 代码风格
- 使用 TypeScript 提供类型安全
- 组件文件名使用 PascalCase (如: `UserProfile.tsx`)
- 样式文件使用 `.module.less` 模块化样式
- 使用 ESLint 和 Prettier 保持代码风格一致

### 组件开发规范
```typescript
// 组件接口定义
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

// 组件实现
const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  // 使用 ahooks 处理副作用
  const { throttle } = useThrottleFn(onAction, { wait: 500 });
  
  return (
    <div className={styles.container}>
      <h2>{title}</h2>
    </div>
  );
};
```

### 样式规范
```less
// 使用 CSS 变量
.container {
  background: var(--background-color);
  border-radius: var(--border-radius-base);
  
  &:hover {
    background: var(--background-color-light);
  }
}
```

## API 设计

### 后端 API 路由
```
GET    /api/tasks           # 获取备份任务列表
POST   /api/tasks           # 创建备份任务
GET    /api/tasks/:id       # 获取特定备份任务
PUT    /api/tasks/:id       # 更新备份任务
DELETE /api/tasks/:id       # 删除备份任务
POST   /api/tasks/:id/backup # 执行备份

GET    /api/logs            # 获取备份日志
GET    /api/logs/stats/summary # 获取统计信息

GET    /api/system/status   # 系统状态
GET    /api/system/settings # 系统设置
PUT    /api/system/settings # 更新设置
```

### 数据模型
```prisma
model BackupTask {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  containerName String
  backupPath  String
  schedule    String   // cron expression
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  backupLogs  BackupLog[]
}

model BackupLog {
  id        String   @id @default(cuid())
  taskId    String
  status    BackupStatus
  startTime DateTime
  endTime   DateTime?
  fileSize  BigInt?
  filePath  String?
  errorMessage String?
  createdAt DateTime @default(now())
  
  task      BackupTask @relation(fields: [taskId], references: [id])
}
```

## 状态管理

### 使用 React Query 管理服务端状态
```typescript
// 获取数据
const { data, isLoading, error } = useQuery(
  'backup-tasks',
  () => fetch('/api/tasks').then(res => res.json())
);

// 更新数据
const mutation = useMutation(
  (taskData) => fetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  }),
  {
    onSuccess: () => {
      queryClient.invalidateQueries('backup-tasks');
    }
  }
);
```

### 使用 ahooks 管理客户端状态
```typescript
// 防抖搜索
const { debounce } = useDebounceFn(
  (value: string) => setSearchTerm(value),
  { wait: 300 }
);

// 本地存储
const [settings, setSettings] = useLocalStorageState('user-settings', {
  defaultValue: { theme: 'light' }
});
```

## 部署

### 构建生产版本
```bash
npm run build
```

### Docker 部署 (未来支持)
```dockerfile
# 后续会添加 Docker 支持
```

## 常见问题

### Q: 如何添加新的备份任务类型？
A: 
1. 在 `backend/src/routes/tasks.ts` 中扩展 API
2. 在数据库模式中添加相应字段
3. 在前端添加对应的表单和展示组件

### Q: 如何自定义主题？
A: 
1. 修改 `frontend/src/index.less` 中的 CSS 变量
2. 更新 `frontend/vite.config.ts` 中的 Less 变量

### Q: 如何集成实际的 Docker 备份脚本？
A: 
1. 将您的备份脚本放在服务器上
2. 在 `.env` 文件中设置 `BACKUP_SCRIPT_PATH`
3. 在 `backend/src/routes/tasks.ts` 的备份触发逻辑中调用脚本

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT License 