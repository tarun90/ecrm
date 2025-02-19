import React from 'react';
import { Empty } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const NoDataUI = () => (
  <div 
    style={{
      textAlign: 'center',
      padding: '48px 0',
      background: '#fafafa',
      border: '1px solid #f0f0f0',
      borderRadius: '2px'
    }}
  >
    <Empty 
      description="No Data Available"
      image={<InboxOutlined style={{ fontSize: '64px', color: '#bfbfbf' }} />}
    />
  </div>
);

export default NoDataUI;