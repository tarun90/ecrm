import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Modal, Form, Input, Select, DatePicker, InputNumber, message, Popconfirm, Upload } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { dealService, contactService } from '../../services/api';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';


const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { Dragger } = Upload;
const { Search } = Input;

const stages = [
  'New Leads',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

function Dashboard() {
  const navigate = useNavigate();

  

  return (
    <MainLayout>
    Welcome to E-CRM
    </MainLayout>
  );
}

export default Dashboard;