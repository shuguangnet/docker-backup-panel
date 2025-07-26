import React from 'react';
import { useQuery } from 'react-query';
import { Settings as SettingsIcon, Save, Database, Folder, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';


interface SystemSettings {
  backupPath: string;
  retentionDays: number;
  maxConcurrentBackups: number;
  notificationEmail: string;
  autoCleanup: boolean;
}

const Settings: React.FC = () => {
  const { data: settings } = useQuery<SystemSettings>(
    'system-settings',
    () => fetch('/api/system/settings').then(res => res.json())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">系统设置</h1>
        <p className="text-muted-foreground">配置备份系统的各项参数</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 备份设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>备份设置</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">备份存储路径</label>
              <Input
                placeholder="/var/backups/docker"
                defaultValue={settings?.backupPath}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">保留天数</label>
              <Input
                type="number"
                placeholder="30"
                defaultValue={settings?.retentionDays}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">最大并发备份数</label>
              <Input
                type="number"
                placeholder="3"
                defaultValue={settings?.maxConcurrentBackups}
              />
            </div>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>通知设置</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">通知邮箱</label>
              <Input
                type="email"
                placeholder="admin@example.com"
                defaultValue={settings?.notificationEmail}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoCleanup"
                defaultChecked={settings?.autoCleanup}
                className="rounded border-gray-300"
              />
              <label htmlFor="autoCleanup" className="text-sm font-medium">
                自动清理过期备份
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>系统信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 p-3 rounded-lg border">
                <Database className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">数据库版本</p>
                  <p className="text-xs text-muted-foreground">SQLite 3.x</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border">
                <Folder className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">存储空间</p>
                  <p className="text-xs text-muted-foreground">2.5 GB / 10 GB</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border">
                <Clock className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">运行时间</p>
                  <p className="text-xs text-muted-foreground">3 天 12 小时</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          保存设置
        </Button>
      </div>
    </div>
  );
};

export default Settings; 