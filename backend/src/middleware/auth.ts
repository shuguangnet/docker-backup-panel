import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 扩展Request类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 确保token不为undefined
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }
    
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 将用户信息添加到请求对象
    req.user = decoded;
    
    return next();
  } catch (error) {
    console.error('认证失败:', error);
    return res.status(401).json({ error: '未授权' });
  }
};

// 管理员权限中间件
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ error: '权限不足' });
  }
};