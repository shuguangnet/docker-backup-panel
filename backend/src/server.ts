import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// 导入路由
import taskRoutes from './routes/tasks';
import logRoutes from './routes/logs';
import systemRoutes from './routes/system';
import authRoutes from './routes/auth';
import scriptRoutes from './routes/scripts';

// 加载环境变量
dotenv.config();

// 初始化 Express 应用
const app = express();
const port = process.env.PORT || 3001;

// 初始化 Prisma 客户端
export const prisma = new PrismaClient();

// 创建默认管理员账号
async function createDefaultAdmin() {
  try {
    // 检查是否已存在用户
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      // 创建默认管理员账号
      const hashedPassword = await bcrypt.hash('admin', 10);
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          name: '管理员',
          role: 'admin'
        }
      });
      console.log('✅ 已创建默认管理员账号 (用户名: admin, 密码: admin)');
    }
  } catch (error) {
    console.error('创建默认管理员账号失败:', error);
  }
}

// 中间件配置
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// CORS 配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 限制每个 IP 15 分钟内最多 100 个请求
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// 解析 JSON 和 URL 编码的请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/scripts', scriptRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// 全局错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('Received SIGINT, gracefully shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, gracefully shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

// 启动服务器
app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // 创建默认管理员账号
  await createDefaultAdmin();
});

export default app;