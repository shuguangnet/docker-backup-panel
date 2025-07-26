import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  FileText,
  Database,
  Menu,
  X,
  User,
  LogOut,
  Terminal,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 菜单项配置
  const menuItems = [
    {
      key: '/',
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: '仪表盘',
    },
    {
      key: '/tasks',
      icon: <Database className="h-4 w-4" />,
      label: '备份任务',
    },
    {
      key: '/logs',
      icon: <FileText className="h-4 w-4" />,
      label: '备份日志',
    },
    {
      key: '/scripts',
      icon: <Terminal className="h-4 w-4" />,
      label: '脚本管理',
    },
    {
      key: '/settings',
      icon: <Settings className="h-4 w-4" />,
      label: '系统设置',
    },
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
    // 在移动端点击菜单后自动收起侧边栏
    if (isMobile) {
      setCollapsed(true);
    }
  };

  const handleLogout = () => {
    // TODO: 实现退出登录逻辑
    console.log('退出登录');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <div className={cn(
        "flex flex-col bg-card border-r transition-all duration-300 z-50",
        isMobile 
          ? "fixed inset-y-0 left-0 w-64 transform transition-transform"
          : "relative",
        isMobile && collapsed ? "-translate-x-full" : "translate-x-0",
        !isMobile && collapsed ? "w-16" : "w-64"
      )}>
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b">
          <Database className="h-6 w-6 text-primary flex-shrink-0" />
          {(!collapsed || isMobile) && (
            <span className="ml-3 text-lg font-semibold truncate">Docker 备份</span>
          )}
        </div>
        
        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleMenuClick(item.key)}
              className={cn(
                "flex items-center w-full px-3 py-3 text-sm rounded-md transition-colors",
                location.pathname === item.key
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              {(!collapsed || isMobile) && <span className="ml-3 truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 头部 */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-background">
          <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="md:hidden flex-shrink-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg md:text-xl font-semibold truncate">Docker 备份管理系统</h1>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* 移动端遮罩层 */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setCollapsed(true)}
        />
      )}
    </div>
  );
};

export default MainLayout;