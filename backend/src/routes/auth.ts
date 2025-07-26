import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

const router = express.Router();

// 注册用户
router.post('/register', async (req, res) => {
  try {
    const { username, password, name } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        // 第一个创建的用户设为管理员
        role: (await prisma.user.count()) === 0 ? 'admin' : 'user'
      }
    });
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('注册失败:', error);
    return res.status(500).json({ error: '注册失败' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // 返回用户信息和令牌
    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('登录失败:', error);
    return res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 验证令牌 - 确保token不为undefined
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return res.status(401).json({ error: '未授权' });
  }
});

export default router;