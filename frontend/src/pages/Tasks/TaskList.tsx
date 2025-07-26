import React from 'react';
import { useQuery } from 'react-query';
import { Plus, Edit, Trash2, Play, Database } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BackupTask {
  id: string;
  name: string;
  containerName: string;
  schedule: string;
  retention: number;
  status: string;
  lastRun: string;
  nextRun: string;
}

const TaskList: React.FC = () => {
  const { data: tasks, isLoading } = useQuery<BackupTask[]>(
    'backup-tasks',
    () => fetch('/api/tasks').then(res => res.json())
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'ERROR':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">备份任务管理</h1>
          <p className="text-sm md:text-base text-muted-foreground">管理和监控 Docker 容器备份任务</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          新建任务
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">任务列表</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Database className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">任务名称</TableHead>
                    <TableHead className="min-w-[120px] hidden md:table-cell">容器名称</TableHead>
                    <TableHead className="min-w-[100px] hidden lg:table-cell">调度计划</TableHead>
                    <TableHead className="min-w-[80px] hidden md:table-cell">保留天数</TableHead>
                    <TableHead className="min-w-[80px]">状态</TableHead>
                    <TableHead className="min-w-[120px] hidden lg:table-cell">上次运行</TableHead>
                    <TableHead className="min-w-[120px] hidden xl:table-cell">下次运行</TableHead>
                    <TableHead className="min-w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks?.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="truncate">{task.name}</span>
                          <span className="text-xs text-muted-foreground md:hidden">
                            {task.containerName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{task.containerName}</TableCell>
                      <TableCell className="hidden lg:table-cell">{task.schedule}</TableCell>
                      <TableCell className="hidden md:table-cell">{task.retention} 天</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(task.status)}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {task.lastRun ? new Date(task.lastRun).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {task.nextRun ? new Date(task.nextRun).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 md:space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Play className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskList; 