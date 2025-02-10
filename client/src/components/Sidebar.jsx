import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  DollarOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  CalendarOutlined,
  ProductOutlined,
  FileTextOutlined,
  MailOutlined
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
    if (path.includes('/tasks')) return '4';
    if (path.includes('/event-manager')) return '5';
    if (path.includes('/products')) return '6';
    if (path.includes('/invoices')) return '7';
    if (path.includes('/webmail')) return '8';



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
      key: '4',
      icon: <UnorderedListOutlined />,
      label: 'Tasks',
      onClick: () => navigate('/tasks'),
    },
    {
      key: '5',
      icon: <CalendarOutlined />,
      label: 'Event-Manager',
      onClick: () => navigate('/event-manager'),
    },
    {
      key: '6',
      icon: <ProductOutlined />,
      label: 'Products',
      onClick: () => navigate('/products'),
    },
    {
      key: '7',
      icon: <FileTextOutlined />,
      label: 'Invoices',
      onClick: () => navigate('/invoices'),
    },
    {
      key: '8',
      icon: <MailOutlined />,
      label: 'Web Mail',
      onClick: () => navigate('/webmail-setup'),
    },
  ];

  return (
    <Sider collapsible collapsed={ collapsed } onCollapse={ onCollapse } className='Sidebar'>
      <div className='sidebar-logo'>

        <HeaderLogo />

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