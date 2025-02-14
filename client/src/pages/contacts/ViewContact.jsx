import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Divider, message } from 'antd';
import { ArrowLeftOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { contactService } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;
const ViewContact = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactById(id);
  }, [id]);

  const fetchContactById = async (id) => {
    try {
      const data = await contactService.getContactById(id);
      setContact(data);
    } catch (error) {
      message.error('Failed to fetch Contact details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 50 }}>Loading...</Text>;
  }

  if (!contact) {
    return <Text type="danger">Contact not found.</Text>;
  }

  return (
    <div style={{ background: '#f0f2f5', padding: 24, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Back Button */}
        <Button
          icon={<ArrowLeftOutlined />}
          type="link"
          onClick={() => navigate('/contacts')}
          style={{ marginBottom: 16 }}
        >
          Back to Contacts
        </Button>

        {/* Company Details Card */}
        <Card style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
      {/* Header with Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        {/* <Avatar size={64} icon={<UserOutlined />} /> */}
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {contact.firstName} {contact.lastName || '-'}
          </Title>
          <Text type="secondary">{contact.jobTitle || 'No Job Title'}</Text>
        </div>
      </div>

      <Divider />

      {/* Contact Details in Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <Text strong>Email:</Text><br />
          <MailOutlined style={{ marginRight: 8 }} />
          {contact.email || '-'}
        </div>

        <div>
          <Text strong>Phone:</Text><br />
          <PhoneOutlined style={{ marginRight: 8 }} />
          {contact.phoneNumber || '-'}
        </div>

        <div>
          <Text strong>Lifecycle Stage:</Text><br />
          {contact.lifecycleStage || '-'}
        </div>

        <div>
          <Text strong>Lead Status:</Text><br />
          {contact.leadStatus || '-'}
        </div>
        <div>
        <Text strong>Company:</Text><br />
       
        {contact.company?.companyName || '-'}
      </div>
   

      <div>
        <Text strong>Contact Owner:</Text><br />
        {contact.contactOwner?.name || '-'}
      </div>
      </div>
    </Card>
      </div>
    </div>
  );
};

export default ViewContact;
