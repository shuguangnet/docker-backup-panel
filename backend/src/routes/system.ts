import express from 'express';
import { prisma } from '../server';

const router = express.Router();

// 获取所有系统设置
router.get('/settings', async (req, res) => {
  try {
    const settings = await prisma.systemSettings.findMany({
      orderBy: { key: 'asc' }
    });
    
    // 转换为键值对象格式
    const settingsMap = settings.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
    
    res.json(settingsMap);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// 获取特定设置
router.get('/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await prisma.systemSettings.findUnique({
      where: { key }
    });
    
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    return res.json({ [key]: setting.value });
  } catch (error: any) {
    console.error('Error fetching setting:', error);
    return res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// 更新系统设置
router.put('/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings format' });
    }
    
    const updates = [];
    
    for (const [key, value] of Object.entries(settings)) {
      updates.push(
        prisma.systemSettings.upsert({
          where: { key },
          update: { value: String(value) },
          create: {
            key,
            value: String(value),
            description: `Auto-created setting for ${key}`
          }
        })
      );
    }
    
    await Promise.all(updates);
    
    return res.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// 获取系统状态信息
router.get('/status', async (req, res) => {
  try {
    const [
      taskCount,
      activeTaskCount,
      totalLogCount,
      recentFailedCount
    ] = await Promise.all([
      prisma.backupTask.count(),
      prisma.backupTask.count({ where: { isActive: true } }),
      prisma.backupLog.count(),
      prisma.backupLog.count({
        where: {
          status: 'FAILED',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 最近24小时
          }
        }
      })
    ]);
    
    res.json({
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: true, // 如果查询成功，说明数据库连接正常
        tasks: taskCount,
        activeTasks: activeTaskCount,
        totalLogs: totalLogCount,
        recentFailures: recentFailedCount
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
});

// 获取 Docker 容器列表 (模拟)
router.get('/containers', async (req, res) => {
  try {
    // TODO: 实际实现应该调用 Docker API 获取容器列表
    // 这里返回模拟数据
    const containers = [
      {
        id: 'container_1',
        name: 'mysql-db',
        image: 'mysql:8.0',
        status: 'running',
        created: new Date('2023-01-01').toISOString()
      },
      {
        id: 'container_2',
        name: 'redis-cache',
        image: 'redis:7.0',
        status: 'running',
        created: new Date('2023-01-02').toISOString()
      },
      {
        id: 'container_3',
        name: 'postgres-db',
        image: 'postgres:15',
        status: 'stopped',
        created: new Date('2023-01-03').toISOString()
      }
    ];
    
    res.json(containers);
  } catch (error) {
    console.error('Error fetching containers:', error);
    res.status(500).json({ error: 'Failed to fetch containers' });
  }
});

// 清理旧日志
router.post('/cleanup', async (req, res) => {
  try {
    const { days = 30 } = req.body;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const deletedCount = await prisma.backupLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        status: {
          in: ['SUCCESS', 'FAILED', 'CANCELLED']
        }
      }
    });
    
    res.json({
      message: `Cleanup completed`,
      deletedLogs: deletedCount.count,
      cutoffDate: cutoffDate.toISOString()
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ error: 'Failed to perform cleanup' });
  }
});

export default router; 