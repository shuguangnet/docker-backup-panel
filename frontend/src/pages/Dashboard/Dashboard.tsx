import React from 'react';
import { useQuery } from 'react-query';
import {
  Database,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SystemStats {
  totalTasks: number;
  activeTasks: number;
  successRate: string;
  recentFailures: number;
}

interface RecentLog {
  id: string;
  taskName: string;
  status: string;
  startTime: string;
  containerName: string;
}

const Dashboard: React.FC = () => {
  // 获取系统统计数据
  const { data: stats, isLoading: statsLoading } = useQuery<SystemStats>(
    'system-stats',
    () => fetch('/api/logs/stats/summary').then(res => res.json())
  );

  // 获取最近的备份日志
  const { data: recentLogs, isLoading: logsLoading } = useQuery<RecentLog[]>(
    'recent-logs',
    () => fetch('/api/logs?limit=5').then(res => res.json().then(data => data.logs))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600';
      case 'FAILED':
        return 'text-red-600';
      case 'RUNNING':
        return 'text-blue-600';
      case 'PENDING':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'RUNNING':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Database className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">仪表盘</h1>
        <p className="text-sm md:text-base text-muted-foreground">Docker 备份系统运行状态概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="p-3 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">总备份任务</CardTitle>
            <Database className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold">{stats?.totalTasks || 0}</div>
          </CardContent>
        </Card>

        <Card className="p-3 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">活跃任务</CardTitle>
            <Loader2 className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold">{stats?.activeTasks || 0}</div>
          </CardContent>
        </Card>

        <Card className="p-3 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">成功率</CardTitle>
            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold">{stats?.successRate || '0'}%</div>
          </CardContent>
        </Card>

        <Card className="p-3 md:p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">近期失败</CardTitle>
            <XCircle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold text-red-600">{stats?.recentFailures || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* 内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* 成功率进度条 */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl">备份成功率</CardTitle>
            <CardDescription className="text-sm">最近 7 天的备份成功率</CardDescription>
          </CardHeader>
          <CardContent className="text-center p-4 md:p-6">
            <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4">
              <svg className="w-24 h-24 md:w-32 md:h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - parseFloat(stats?.successRate || '0') / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg md:text-2xl font-bold">{stats?.successRate || '0'}%</span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              总共执行了 {stats?.totalTasks || 0} 次备份任务
            </p>
          </CardContent>
        </Card>

        {/* 最近备份日志 */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl">最近备份记录</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {logsLoading ? (
              <div className="flex items-center justify-center py-6 md:py-8">
                <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {recentLogs?.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 md:space-x-4 p-2 md:p-3 rounded-lg border">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(log.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                        <p className="text-sm font-medium truncate">{log.taskName}</p>
                        <span className={cn("text-xs px-2 py-1 rounded-full self-start sm:self-auto", getStatusColor(log.status))}>
                          {log.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                        <div className="truncate">容器: {log.containerName}</div>
                        <div className="truncate">时间: {new Date(log.startTime).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 