import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  Typography, 
  Card,
  Divider,
  message
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { createCompany, getCompanyById, updateCompany } from './APIServices';
import { useParams, useNavigate } from 'react-router-dom';
const { Title } = Typography;


const AddCompanyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
 

  const fetchCompanybyId = async (id)=>{
    let data = await getCompanyById(id);
    console.log(data)
    form.setFieldValue('companyOwner', data.companyOwner)
    form.setFieldValue('companyName', data.companyName)
    form.setFieldValue('email', data.email);
        form.setFieldValue('phone', data.phone);
        form.setFieldValue('mobile', data.mobile);
        form.setFieldValue('website', data.website);
        form.setFieldValue('industry', data.industry);
        form.setFieldValue('currency', data.currency);
        form.setFieldValue('gstin', data.gstin);
        form.setFieldValue('street', data.address.street);
        form.setFieldValue('city', data.address.city);
        form.setFieldValue('state', data.address.state);
        form.setFieldValue('country', data.address.country);
        form.setFieldValue('region', data.address.region);

  }
  if(id){
    fetchCompanybyId(id);
  }
  const industries = [
    'Technology', 'Manufacturing', 'Healthcare', 'Retail', 
    'Financial Services', 'Education', 'Other'
  ];

  const currencies = ['USD', 'EUR', 'INR', 'GBP', 'AUD', 'CAD'];

  const handleSubmit = async (values) => {
    try {
      if(id)
      {
        const response = await updateCompany(id, values);
        message.success('Company updated successfully');
        navigate('/company'); // Adjust the route as needed
      }else{
      const response = await createCompany(values);
      message.success('Company created successfully');
      navigate('/company'); // Adjust the route as needed
      }
    } catch (error) {
      message.error(error.message || 'Error creating company');
    }
  };

  return (
    <div style={{ background: '#f0f2f5', padding: 24, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Back Button */}
        <Button 
          icon={<ArrowLeftOutlined />} 
          type="link" 
          onClick={() => window.history.back()}
          style={{ marginBottom: 16 }}
        >
          Back to Companies
        </Button>

        <Card style={{background:'#fff'}}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              industry: '',
              currency: ''
            }}
          >
            {/* Company Information Section */}
            <Title level={4}>Company Information</Title>
            <Divider />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item
                label="Company Owner"
                name="companyOwner"
                rules={[{ required: true, message: 'Please input company owner!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Company Name"
                name="companyName"
                rules={[{ required: true, message: 'Please input company name!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please input email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Phone"
                name="phone"
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Mobile"
                name="mobile"
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Website"
                name="website"
                rules={[{ type: 'url', message: 'Please enter a valid URL!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Industry"
                name="industry"
              >
                <Select placeholder="Select Industry">
                  {industries.map(industry => (
                    <Select.Option key={industry} value={industry}>
                      {industry}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Currency"
                name="currency"
              >
                <Select placeholder="Select Currency">
                  {currencies.map(currency => (
                    <Select.Option key={currency} value={currency}>
                      {currency}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="GSTIN"
                name="gstin"
              >
                <Input />
              </Form.Item>
            </div>

            {/* Address Information Section */}
            <Title level={4} style={{ marginTop: 32 }}>Address Information</Title>
            <Divider />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item
                label="Street"
                name="street"
                style={{ gridColumn: '1 / -1' }}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="City"
                name="city"
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="State"
                name="state"
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Country"
                name="country"
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Region"
                name="region"
              >
                <Input />
              </Form.Item>
            </div>

            {/* Form Actions */}
            <Divider />
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  { id ? "Update Company" : "Save Company"}
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AddCompanyForm;