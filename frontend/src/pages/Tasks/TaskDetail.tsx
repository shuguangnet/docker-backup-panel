import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const TaskDetail: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>任务详情</Title>
      <p>任务详情功能开发中...</p>
    </div>
  );
};

export default TaskDetail; 