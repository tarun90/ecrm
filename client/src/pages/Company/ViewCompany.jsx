import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Divider, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getCompanyById } from './APIServices';
import { useParams, useNavigate } from 'react-router-dom';
import './ViewCompany.css';

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
    return <div className="view-company-loading">Loading...</div>;
  }

  if (!company) {
    return <div className="view-company-error">Company not found.</div>;
  }

  return (
    <div className="view-company-container">
      <div className="view-company-wrapper">
        <Button
          icon={ <ArrowLeftOutlined /> }
          type="link"
          onClick={ () => navigate('/company') }
          className="back-button text-btn"
        >
          Back to Companies
        </Button>

        <Card className="company-details-card">
          <section className="company-section">
            <Title level={ 4 }>Company Information</Title>
            <Divider />

            <div className="info-grid">
              <div className="info-item">
                <Text strong>Company Owner</Text>
                <div className="info-value">{ company.companyOwner || '-' }</div>
              </div>
              <div className="info-item">
                <Text strong>Company Name</Text>
                <div className="info-value">{ company.companyName || '-' }</div>
              </div>
              <div className="info-item">
                <Text strong>Email</Text>
                <div className="info-value">{ company.email || '-' }</div>
              </div>
              <div className="info-item">
                <Text strong>Phone</Text>
                <div className="info-value">{ company.phone || '-' }</div>
              </div>
              <div className="info-item">
                <Text strong>Mobile</Text>
                <div className="info-value">{ company.mobile || '-' }</div>
              </div>
              <div className="info-item">
                <Text strong>Website</Text>
                <div className="info-value">
                  { company.website ? (
                    <a href={ company.website } target="_blank" rel="noopener noreferrer">
                      { company.website }
                    </a>
                  ) : (
                    '-'
                  ) }
                </div>
              </div>
              <div className="info-item">
                <Text strong>Industry</Text>
                <div className="info-value">{ company.industry || '-' }</div>
              </div>
              <div className="info-item">
                <Text strong>Currency</Text>
                <div className="info-value">{ company.currency || '-' }</div>
              </div>
              <div className="info-item">
                <Text strong>GSTIN</Text>
                <div className="info-value">{ company.gstin || '-' }</div>
              </div>
            </div>
          </section>

          <section className="address-section">
            <Title level={ 4 }>Address Information</Title>
            <Divider />

            <div className="info-grid">
              <div className="info-item full-width">
                <Text strong>Street</Text>
                <div className="info-value">{ company.address?.street || '-' }</div>
              </div>
              <div className="info-item">
                <Text strong>City</Text>
                <div className="info-value">{ company.address?.city || '-' }</div>
              </div>
              <div className="info-item">
                <Text strong>State</Text>
                <div className="info-value">{ company.address?.state || '-' }</div>
              </div>
              <div className="info-item">
                <Text strong>Country</Text>
                <div className="info-value">{ company.address?.country || '-' }</div>
              </div>
              <div className="info-item">
                <Text strong>Region</Text>
                <div className="info-value">{ company.address?.region || '-' }</div>
              </div>
            </div>
          </section>

          <Divider />
          <div className="action-buttons">
            <Space>
              <Button className='text-btn' onClick={ () => navigate('/company') }>
                Back
              </Button>
              <Button type="primary" onClick={ () => navigate(`/company/edit/${id}`) }>
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