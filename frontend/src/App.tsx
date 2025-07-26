import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './lib/auth';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import TaskList from './pages/Tasks/TaskList';
import TaskDetail from './pages/Tasks/TaskDetail';
import LogList from './pages/Logs/LogList';
import Settings from './pages/Settings/Settings';
import ScriptList from './pages/Scripts/ScriptList';

import './App.css';

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/tasks" element={
          <ProtectedRoute>
            <MainLayout>
              <TaskList />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/tasks/:id" element={
          <ProtectedRoute>
            <MainLayout>
              <TaskDetail />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/logs" element={
          <ProtectedRoute>
            <MainLayout>
              <LogList />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/scripts" element={
          <ProtectedRoute>
            <MainLayout>
              <ScriptList />
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

export default App;