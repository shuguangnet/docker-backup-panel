import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Trash, Upload, Plus, FileCode } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';

interface Script {
  name: string;
  path: string;
  size: number;
  modified: string;
}

const ScriptList: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [scriptContent, setScriptContent] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [newScriptName, setNewScriptName] = useState<string>('');
  const [newScriptContent, setNewScriptContent] = useState<string>('');
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  // 获取脚本列表
  const fetchScripts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/scripts');
      setScripts(response.data);
    } catch (error) {
      console.error('获取脚本列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取脚本内容
  const fetchScriptContent = async (name: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/scripts/${name}`);
      setScriptContent(response.data.content);
      setSelectedScript(name);
    } catch (error) {
      console.error('获取脚本内容失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 运行脚本
  const runScript = async () => {
    if (!selectedScript) return;
    
    try {
      setIsRunning(true);
      setOutput('正在执行脚本...');
      
      const response = await axios.post(`/api/scripts/run/${selectedScript}`);
      
      setOutput(`退出代码: ${response.data.exitCode}\n\n输出:\n${response.data.output}\n\n错误:\n${response.data.error}`);
    } catch (error: any) {
      console.error('执行脚本失败:', error);
      setOutput(`执行失败: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 上传新脚本
  const uploadScript = async () => {
    if (!newScriptName || !newScriptContent) return;
    
    try {
      setIsLoading(true);
      await axios.post('/api/scripts/upload', {
        name: newScriptName.endsWith('.sh') ? newScriptName : `${newScriptName}.sh`,
        content: newScriptContent
      });
      
      // 重置表单
      setNewScriptName('');
      setNewScriptContent('');
      
      // 刷新脚本列表
      fetchScripts();
    } catch (error) {
      console.error('上传脚本失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 删除脚本
  const deleteScript = async (name: string) => {
    if (!confirm(`确定要删除脚本 ${name} 吗？`)) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`/api/scripts/${name}`);
      
      // 如果删除的是当前选中的脚本，清空内容
      if (selectedScript === name) {
        setSelectedScript(null);
        setScriptContent('');
      }
      
      // 刷新脚本列表
      fetchScripts();
    } catch (error) {
      console.error('删除脚本失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchScripts();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">脚本管理</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 脚本列表 */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>可用脚本</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading && <p>加载中...</p>}
              
              {!isLoading && scripts.length === 0 && (
                <p className="text-muted-foreground">暂无可用脚本</p>
              )}
              
              <div className="space-y-2">
                {scripts.map((script) => (
                  <div 
                    key={script.name}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${selectedScript === script.name ? 'bg-primary/10' : 'hover:bg-accent'}`}
                    onClick={() => fetchScriptContent(script.name)}
                  >
                    <div className="flex items-center space-x-3">
                      <FileCode className="h-4 w-4" />
                      <span>{script.name}</span>
                    </div>
                    
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteScript(script.name);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 脚本内容和执行 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedScript ? `脚本: ${selectedScript}` : '选择脚本'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedScript ? (
              <>
                <div className="border rounded-md">
                  <pre className="p-4 overflow-auto max-h-64">{scriptContent}</pre>
                </div>
                
                {isAdmin && (
                  <Button 
                    onClick={runScript} 
                    disabled={isRunning}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isRunning ? '执行中...' : '执行脚本'}
                  </Button>
                )}
                
                {output && (
                  <div className="border rounded-md mt-4">
                    <div className="bg-muted p-2 font-medium">执行结果</div>
                    <pre className="p-4 overflow-auto max-h-64 bg-black text-white">{output}</pre>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">请从左侧选择一个脚本查看详情</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* 上传新脚本 */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>上传新脚本</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="scriptName" className="text-sm font-medium">
                  脚本名称
                </label>
                <Input
                  id="scriptName"
                  value={newScriptName}
                  onChange={(e) => setNewScriptName(e.target.value)}
                  placeholder="例如: backup.sh"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="scriptContent" className="text-sm font-medium">
                  脚本内容
                </label>
                <textarea
                  id="scriptContent"
                  value={newScriptContent}
                  onChange={(e) => setNewScriptContent(e.target.value)}
                  placeholder="#!/bin/bash\n\n# 在此输入脚本内容"
                  className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <Button 
                onClick={uploadScript} 
                disabled={!newScriptName || !newScriptContent || isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                上传脚本
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScriptList;