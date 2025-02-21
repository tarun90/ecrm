import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  DollarOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MailOutlined,
  FolderOutlined,
  AppstoreOutlined,
  FileDoneOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderLogo from '../assets/Icons/headerlogo';
import CompanyIcon from '../../public/Company';

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
    if (path.includes('/company')) return '9';
    if (path.includes('/outreach')) return '10';
    if (path.includes('/sales')) return '11';

    return '1';
  };

  const isAdmin = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData'))
    .isAdmin : {}
    const isRegionHead = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData'))
    .isRegionHead : {}
    const isSuperAdmin = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData'))
    .isSuperAdmin : {}
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
      icon: <FileDoneOutlined />,
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
      icon: <AppstoreOutlined />,
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
    {
      key: '9',
      icon: <CompanyIcon />,
      label: 'Company',
      onClick: () => navigate('/company'),
    },
    {
      key: '10',
      icon: <FolderOutlined />,
      label: 'Out-reach',
      className: 'menu-item-outreach',

      children: [
        isAdmin && {
          key: '10-1',
          label: 'Campaigns',
          onClick: () => navigate('/outreach/campaign'),
        },
        isAdmin && {
          key: '10-2',
          label: 'Categories',
          onClick: () => navigate('/outreach/categories'),
        },
        {
          key: '10-3',
          label: 'Outreach',
          onClick: () => navigate('/outreach/list'),
        },
        (isRegionHead || isSuperAdmin) && {
          key: '10-4',
          label: 'Analytics',
          onClick: () => navigate('/outreach/analytics'),
        },
        (isRegionHead || isSuperAdmin) && {
          key: '10-5',
          label: 'Analytics2',
          onClick: () => navigate('/outreach/analytics2'),
        }
      ].filter(Boolean),
    },
    {
      key: '11',
      icon: <FileTextOutlined />,
      label: 'Sales',
      onClick: () => navigate('/sales'),
    }
  ];

  return (
    <Sider collapsible collapsed={ collapsed } onCollapse={ onCollapse } className="Sidebar">
      <div className="sidebar-logo">
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
