import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// 获取可用脚本列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const scriptsDir = path.join(__dirname, '../../scripts');
    
    // 确保脚本目录存在
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }
    
    // 读取脚本文件
    const files = fs.readdirSync(scriptsDir);
    const scripts = files
      .filter(file => file.endsWith('.sh'))
      .map(file => {
        const filePath = path.join(scriptsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime
        };
      });
    
    return res.json(scripts);
  } catch (error) {
    console.error('获取脚本列表失败:', error);
    return res.status(500).json({ error: '获取脚本列表失败' });
  }
});

// 获取脚本内容
router.get('/:name', authMiddleware, async (req, res) => {
  try {
    const { name } = req.params;
    
    // 确保name不为undefined
    if (!name) {
      return res.status(400).json({ error: '脚本名称不能为空' });
    }
    
    const scriptPath = path.join(__dirname, '../../scripts', name);
    
    if (!fs.existsSync(scriptPath)) {
      return res.status(404).json({ error: '脚本不存在' });
    }
    
    const content = fs.readFileSync(scriptPath, 'utf8');
    return res.json({ name, content });
  } catch (error) {
    console.error('获取脚本内容失败:', error);
    return res.status(500).json({ error: '获取脚本内容失败' });
  }
});

// 执行脚本
router.post('/run/:name', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name } = req.params;
    
    // 确保name不为undefined
    if (!name) {
      return res.status(400).json({ error: '脚本名称不能为空' });
    }
    
    const { args = [] } = req.body;
    const scriptPath = path.join(__dirname, '../../scripts', name);
    
    if (!fs.existsSync(scriptPath)) {
      return res.status(404).json({ error: '脚本不存在' });
    }
    
    // 确保脚本有执行权限
    fs.chmodSync(scriptPath, '755');
    
    // 构建命令
    const command = `${scriptPath} ${args.join(' ')}`;
    
    // 执行脚本
    const child = exec(command);
    
    let output = '';
    let errorOutput = '';
    
    // 收集输出
    child.stdout?.on('data', (data) => {
      output += data;
    });
    
    child.stderr?.on('data', (data) => {
      errorOutput += data;
    });
    
    // 处理脚本执行完成
    child.on('close', (code) => {
      return res.json({
        name,
        exitCode: code,
        output,
        error: errorOutput
      });
    });
    
    // 注意：这里不需要return，因为响应会在child.on('close')回调中发送
    // 但为了满足TypeScript的要求，我们可以添加一个不会执行到的return语句
    return;
  } catch (error) {
    console.error('执行脚本失败:', error);
    return res.status(500).json({ error: '执行脚本失败' });
  }
});

// 上传脚本
router.post('/upload', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, content } = req.body;
    
    if (!name || !content) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 验证脚本名称
    if (!name.endsWith('.sh')) {
      return res.status(400).json({ error: '脚本文件必须以.sh结尾' });
    }
    
    const scriptPath = path.join(__dirname, '../../scripts', name);
    
    // 写入脚本文件
    fs.writeFileSync(scriptPath, content);
    
    // 设置执行权限
    fs.chmodSync(scriptPath, '755');
    
    return res.status(201).json({ name, path: scriptPath });
  } catch (error) {
    console.error('上传脚本失败:', error);
    return res.status(500).json({ error: '上传脚本失败' });
  }
});

// 删除脚本
router.delete('/:name', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name } = req.params;
    
    // 确保name不为undefined
    if (!name) {
      return res.status(400).json({ error: '脚本名称不能为空' });
    }
    
    const scriptPath = path.join(__dirname, '../../scripts', name);
    
    if (!fs.existsSync(scriptPath)) {
      return res.status(404).json({ error: '脚本不存在' });
    }
    
    // 删除脚本文件
    fs.unlinkSync(scriptPath);
    
    return res.json({ success: true, message: '脚本已删除' });
  } catch (error) {
    console.error('删除脚本失败:', error);
    return res.status(500).json({ error: '删除脚本失败' });
  }
});

export default router;