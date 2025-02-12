import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Divider, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getCompanyById } from './APIServices';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ViewCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyById(id);
  }, [id]);

  const fetchCompanyById = async (id) => {
    try {
      const data = await getCompanyById(id);
      setCompany(data);
    } catch (error) {
      message.error('Failed to fetch company details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 50 }}>Loading...</Text>;
  }

  if (!company) {
    return <Text type="danger">Company not found.</Text>;
  }

  return (
    <div style={{ background: '#f0f2f5', padding: 24, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Back Button */}
        <Button 
          icon={<ArrowLeftOutlined />} 
          type="link" 
          onClick={() => navigate('/company')}
          style={{ marginBottom: 16 }}
        >
          Back to Companies
        </Button>

        {/* Company Details Card */}
        <Card style={{ background: '#fff', padding: 20 }}>
          <Title level={4}>Company Information</Title>
          <Divider />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><Text strong>Company Owner:</Text> <br /> {company.companyOwner || '-'}</div>
            <div><Text strong>Company Name:</Text> <br /> {company.companyName || '-'}</div>
            <div><Text strong>Email:</Text> <br /> {company.email || '-'}</div>
            <div><Text strong>Phone:</Text> <br /> {company.phone || '-'}</div>
            <div><Text strong>Mobile:</Text> <br /> {company.mobile || '-'}</div>
            <div><Text strong>Website:</Text> <br /> 
              {company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a> : '-'}
            </div>
            <div><Text strong>Industry:</Text> <br /> {company.industry || '-'}</div>
            <div><Text strong>Currency:</Text> <br /> {company.currency || '-'}</div>
            <div><Text strong>GSTIN:</Text> <br /> {company.gstin || '-'}</div>
          </div>

          <Title level={4} style={{ marginTop: 32 }}>Address Information</Title>
          <Divider />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><Text strong>Street:</Text> <br /> {company.address?.street || '-'}</div>
            <div><Text strong>City:</Text> <br /> {company.address?.city || '-'}</div>
            <div><Text strong>State:</Text> <br /> {company.address?.state || '-'}</div>
            <div><Text strong>Country:</Text> <br /> {company.address?.country || '-'}</div>
            <div><Text strong>Region:</Text> <br /> {company.address?.region || '-'}</div>
          </div>

          {/* Form Actions */}
          <Divider />
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => navigate('/company')}>
                Back
              </Button>
              <Button type="primary" onClick={() => navigate(`/company/edit/${id}`)}>
                Edit Company
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ViewCompany;
