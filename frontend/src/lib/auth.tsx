import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 配置axios默认设置
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserData();
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // 获取用户数据
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('获取用户信息失败:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // 登录
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, user } = response.data;
      
      // 保存令牌和用户信息
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
    } catch (err: any) {
      console.error('登录失败:', err);
      setError(err.response?.data?.error || '登录失败，请检查用户名和密码');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 退出登录
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};