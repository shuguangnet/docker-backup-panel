import express from 'express';
import { prisma } from '../server';

// 定义备份状态常量
const BackupStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
} as const;

const router = express.Router();

// 获取所有备份日志
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, taskId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    if (status) where.status = status;
    if (taskId) where.taskId = taskId;
    
    const [logs, total] = await Promise.all([
      prisma.backupLog.findMany({
        where,
        include: {
          task: {
            select: {
              name: true,
              containerName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.backupLog.count({ where })
    ]);
    
    return res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// 根据 ID 获取特定备份日志
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const log = await prisma.backupLog.findUnique({
      where: { id },
      include: {
        task: true
      }
    });
    
    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    return res.json(log);
  } catch (error: any) {
    console.error('Error fetching log:', error);
    return res.status(500).json({ error: 'Failed to fetch log' });
  }
});

// 更新备份日志状态
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, endTime, fileSize, filePath, errorMessage } = req.body;
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (endTime) updateData.endTime = new Date(endTime);
    if (fileSize !== undefined) updateData.fileSize = BigInt(fileSize);
    if (filePath !== undefined) updateData.filePath = filePath;
    if (errorMessage !== undefined) updateData.errorMessage = errorMessage;
    
    const log = await prisma.backupLog.update({
      where: { id },
      data: updateData
    });
    
    return res.json(log);
  } catch (error: any) {
    console.error('Error updating log:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Log not found' });
    }
    return res.status(500).json({ error: 'Failed to update log' });
  }
});

// 获取备份统计信息
router.get('/stats/summary', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // 计算时间范围
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const [
      totalLogs,
      successLogs,
      failedLogs,
      runningLogs,
      recentLogs
    ] = await Promise.all([
      prisma.backupLog.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.backupLog.count({
        where: {
          status: BackupStatus.SUCCESS,
          createdAt: { gte: startDate }
        }
      }),
      prisma.backupLog.count({
        where: {
          status: BackupStatus.FAILED,
          createdAt: { gte: startDate }
        }
      }),
      prisma.backupLog.count({
        where: {
          status: BackupStatus.RUNNING,
          createdAt: { gte: startDate }
        }
      }),
      prisma.backupLog.findMany({
        include: {
          task: {
            select: {
              name: true,
              containerName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);
    
    return res.json({
      period,
      stats: {
        total: totalLogs,
        success: successLogs,
        failed: failedLogs,
        running: runningLogs,
        successRate: totalLogs > 0 ? ((successLogs / totalLogs) * 100).toFixed(2) : '0'
      },
      recentLogs
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// 删除备份日志
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.backupLog.delete({
      where: { id }
    });
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting log:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Log not found' });
    }
    return res.status(500).json({ error: 'Failed to delete log' });
  }
});

export default router; 