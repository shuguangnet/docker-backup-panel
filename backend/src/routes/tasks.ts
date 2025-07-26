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

// 获取所有备份任务
router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.backupTask.findMany({
      include: {
        backupLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1 // 只获取最新的一条日志
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// 根据 ID 获取特定备份任务
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.backupTask.findUnique({
      where: { id },
      include: {
        backupLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    return res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// 创建新的备份任务
router.post('/', async (req, res) => {
  try {
    const { name, description, containerName, backupPath, schedule } = req.body;
    
    // 验证必需字段
    if (!name || !containerName || !backupPath || !schedule) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, containerName, backupPath, schedule' 
      });
    }
    
    const task = await prisma.backupTask.create({
      data: {
        name,
        description,
        containerName,
        backupPath,
        schedule
      }
    });
    
    return res.status(201).json(task);
  } catch (error: any) {
    console.error('Error creating task:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Task name already exists' });
    }
    
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// 更新备份任务
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, containerName, backupPath, schedule, isActive } = req.body;
    
    const task = await prisma.backupTask.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(containerName && { containerName }),
        ...(backupPath && { backupPath }),
        ...(schedule && { schedule }),
        ...(isActive !== undefined && { isActive })
      }
    });
    
    return res.json(task);
  } catch (error: any) {
    console.error('Error updating task:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Task name already exists' });
    }
    
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

// 删除备份任务
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.backupTask.delete({
      where: { id }
    });
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting task:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

// 启动备份任务
router.post('/:id/backup', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查任务是否存在
    const task = await prisma.backupTask.findUnique({
      where: { id }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // 创建备份日志记录
    const backupLog = await prisma.backupLog.create({
      data: {
        taskId: id,
        status: BackupStatus.PENDING,
        startTime: new Date()
      }
    });
    
    // TODO: 在这里触发实际的备份脚本
    console.log(`Starting backup for task: ${task.name}`);
    
    return res.status(202).json({ 
      message: 'Backup started',
      logId: backupLog.id 
    });
  } catch (error) {
    console.error('Error starting backup:', error);
    return res.status(500).json({ error: 'Failed to start backup' });
  }
});

export default router; 