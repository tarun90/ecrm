import React, { useState } from 'react';
import { Layout, Avatar, Dropdown, Menu } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const { Header, Content } = Layout;
const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {}
const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end' 
        }}>
          <Dropdown overlay={userMenu} trigger={['click']}>
            {(userData?.img && userData?.img != "") ? 
           <img src="#" alt="User Profile" /> :    <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
          }
            
          </Dropdown>
        </Header>
        <Content style={{ margin: '10px 10px', padding: 10 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;