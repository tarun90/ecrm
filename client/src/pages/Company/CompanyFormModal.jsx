import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Modal,
  Divider,
  message,
  Drawer,
  Row,
  Col
} from 'antd';
import { createCompany, getCompanyById, Getcountry, updateCompany } from './APIServices';
import currenciesData from './currency';
import { useEffect } from 'react';

const { TextArea } = Input;

const CompanyFormModal = ({ visible, onCancel, editId = null, fetchCompanies, contectListComnyName = null }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [country, setCountry] = useState([])

  const fetchCompanyById = async (id) => {
    try {
      const data = await getCompanyById(id);
      form.setFieldsValue({
        companyName: data.companyName,
        companyOwner: data.companyOwner,
        email: data.email,
        phoneNumber: data.phoneNumber,
        industry: data.industry,
        type: data.type,
        city: data.city,
        stateRegion: data.stateRegion,
        country: data.country,
        postalCode: data.postalCode,
        numberOfEmployees: data.numberOfEmployees,
        annualRevenue: data.annualRevenue,
        timeZone: data.timeZone,
        description: data.description,
        linkedinPage: data.linkedinPage,
        webTechnologies: data.webTechnologies,
        websiteUrl: data.websiteUrl,
        Currency: data.Currency
      });
    } catch (error) {
      message.error('Error fetching company details');
    }
  };

  React.useEffect(() => {
    if (visible && editId) {
      fetchCompanyById(editId);
    }

  }, [visible, editId]);

  React.useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
    form.setFieldsValue({
      companyName: contectListComnyName,
    })

  }, [visible]);

  const industries = [
    'Technology',
    'Manufacturing',
    'Healthcare',
    'Retail',
    'Financial Services',
    'Education',
    'Consulting',
    'E-commerce',
    'Other'
  ];

  const companyTypes = [
    'Prospect',
    'Partner',
    'Reseller',
    'Vendor',
    'Other'
  ];

  const countries = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'India',
    'Japan',
    // Add more countries as needed
  ];

  const webTechnologies = [
    'React',
    'Angular',
    'Vue.js',
    'Node.js',
    'Python',
    'Java',
    'PHP',
    'WordPress',
    'Other'
  ];


  //country data fetch
  const fetchCountry = async () => {
    try {
      let data = await Getcountry();
      setCountry(data.data);
    } catch (error) {
      console.log(error);

    }
  }
  useEffect(() => {
    fetchCountry()
  }, [])

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (editId) {
        await updateCompany(editId, values);
        fetchCompanies();
        message.success('Company updated successfully');
      } else {
        await createCompany(values);
        fetchCompanies();
        message.success('Company created successfully');
      }
      let letcompanyName = form.getFieldsValue('companyName')

      onCancel(letcompanyName.companyName);
    } catch (error) {
      message.error(error.message || 'Error saving company');
    } finally {
      setLoading(false);
    }
  };

  return (


    <Drawer
      title={ editId ? "Edit Company" : "Create Company" }
      open={ visible }
      onClose={ onCancel }
      width={ 400 }
      footer={
        <div style={ { display: "flex", justifyContent: "flex-end", gap: "8px" } }>
          <Button onClick={ onCancel } className="text-btn">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={ loading }>
            { editId ? "Update Company" : "Save Company" }
          </Button>
        </div>
      }
    >
      <Form
        form={ form }
        layout="vertical"
        onFinish={ handleSubmit }
        initialValues={ {
          industry: "",
          type: "",
          country: "",
          webTechnologies: [],
        } }
      >
        <Row gutter={ 24 }>
          <Col span={ 24 }>
            <Form.Item
              label="Company Name"
              name="companyName"
              rules={ [{ required: true, message: "Please input company name!" }] }
            >
              <Input placeholder="Company Name" />
            </Form.Item>

            <Form.Item
              label="Company Owner"
              name="companyOwner"
              rules={ [{ required: true, message: "Please input company owner!" }] }
            >
              <Input placeholder="Company Owner" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={ [
                { required: true, message: "Please input email!" },
                { type: "email", message: "Please enter a valid email!" },
              ] }
            >
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={ [{ pattern: /^[0-9+-]+$/, message: "Please enter a valid phone number!" }] }
            >
              <Input placeholder="Phone Number" />
            </Form.Item>
          </Col>

          <Col span={ 24 }>
            <Form.Item
              label="Industry"
              name="industry"
              rules={ [{ required: true, message: "Please select an industry!" }] }
            >
              <Select placeholder="Select Industry">
                { industries.map((industry) => (
                  <Select.Option key={ industry } value={ industry }>
                    { industry }
                  </Select.Option>
                )) }
              </Select>
            </Form.Item>

            <Form.Item
              label="Type"
              name="type"
              rules={ [{ required: true, message: "Please select company type!" }] }
            >
              <Select placeholder="Select Type">
                { companyTypes.map((type) => (
                  <Select.Option key={ type } value={ type }>
                    { type }
                  </Select.Option>
                )) }
              </Select>
            </Form.Item>

            <Form.Item
              label="Website URL"
              name="websiteUrl"
              rules={ [
                { required: true, message: "Please input website URL!" },
                { type: "url", message: "Please enter a valid URL!" },
              ] }
            >
              <Input placeholder="Website URL" />
            </Form.Item>

            <Form.Item
              label="Country"
              name="country"
              rules={ [{ required: true, message: "Please select a country!" }] }
            >
              <Select placeholder="Select Country" showSearch allowClear>
                { country?.map((item, index) => (
                  <Select.Option key={ index } value={ item?.name } style={ { textTransform: "capitalize" } }>
                    { item?.name }
                  </Select.Option>
                )) }
              </Select>
            </Form.Item>
          </Col>
        </Row>


      </Form>
    </Drawer>

  );
};

export default CompanyFormModal;