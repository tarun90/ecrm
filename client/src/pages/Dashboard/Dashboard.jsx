import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Spin, 
  Alert,
  Typography,
} from 'antd';
import { 
  FileOutlined, 
  TeamOutlined, 
  PhoneOutlined,
  AppstoreOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { getDashboardStats } from './dashboardService';

const { Title } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {}
  useEffect(() => {
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    if(userData?.isSuperAdmin)
    {
    fetchData();
    }
    else{
    setLoading(false)

    }
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    (userData?.isSuperAdmin) ?
      <>
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dashboard Overview</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Datasets"
              value={stats?.totalCampaigns}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="CSV Uploads"
              value={stats?.csvUploads}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Outreach"
              value={stats?.totalOutreach}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Touches"
              value={stats?.totalTouches}
              prefix={<PhoneOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="No. of Datasets touches last week"
              value={stats?.activeCampaigns}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Unique Touches (Last 7 Days)"
              value={stats?.uniqueTouchesLast7Days}
              suffix={`/ ${stats?.totalTouchesLast7Days} total`}
            />
          </Card>
        </Col>
      </Row>
    </div>
    </>
    :
    <>Welcome to E-CRM</>
  );
};

export default Dashboard;