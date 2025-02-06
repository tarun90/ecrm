import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  DollarOutlined,
  TeamOutlined,
  SettingOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderLogo from '../assets/Icons/headerlogo';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getDefaultSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return '1';
    if (path.includes('/deals')) return '2';
    if (path.includes('/contacts')) return '3';
    return '1';
  };

  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
    },
    {
      key: '2',
      icon: <DollarOutlined />,
      label: 'Deals',
      onClick: () => navigate('/deals'),
    },
    {
      key: '3',
      icon: <TeamOutlined />,
      label: 'Contacts',
      onClick: () => navigate('/contacts'),
    },
    {
      key: '5',
      icon: <CalendarOutlined />,
      label: 'Event-Manager',
      onClick: () => navigate('/event-manager'),
    },
  ];

  return (
    <Sider collapsible collapsed={ collapsed } onCollapse={ onCollapse } className='Sidebar'>
      <div style={ {
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '20px',
        fontWeight: 'bold'
      } }>
        <div className='sidebar-logo'>
          <HeaderLogo />
        </div>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={ [getDefaultSelectedKey()] }
        items={ menuItems }
      />
    </Sider>
  );
};

export default Sidebar;