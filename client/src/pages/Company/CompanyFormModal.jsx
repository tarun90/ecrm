import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Modal,
  Divider,
  message
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
    <Modal
      title={ editId ? "Edit Company" : "Add Company" }
      open={ visible }
      onCancel={ onCancel }
      width={ 600 }
      footer={ null }
    >
      <Divider />
      <Form
        form={ form }
        layout="vertical"
        onFinish={ handleSubmit }
        initialValues={ {
          industry: '',
          type: '',
          country: '',
          webTechnologies: []
        } }
      >
        <div className='modal-content scroll'>
          <div className="form-grid" style={ { display: 'grid', gridTemplateColumns: '1fr 1fr' } }>
            <Form.Item
              label="Company Name"
              name="companyName"
              rules={ [{ required: true, message: 'Please input company name!' }] }
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Company Owner"
              name="companyOwner"
              rules={ [{ required: true, message: 'Please input company owner!' }] }
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={ [
                { type: 'email', message: 'Please enter a valid email address!' }
              ] }
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={ [
                { pattern: /^[0-9+-]+$/, message: 'Please enter a valid phone number!' }
              ] }
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Industry"
              name="industry"
              rules={ [{ required: true, message: 'Please select an industry!' }] }
            >
              <Select placeholder="Select Industry">
                { industries.map(industry => (
                  <Select.Option key={ industry } value={ industry }>
                    { industry }
                  </Select.Option>
                )) }
              </Select>
            </Form.Item>

            <Form.Item
              label="Type"
              name="type"
              rules={ [{ required: true, message: 'Please select company type!' }] }
            >
              <Select placeholder="Select Type">
                { companyTypes.map(type => (
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
                { required: true, message: 'Please input website URL!' },
                { type: 'url', message: 'Please enter a valid URL!' }
              ] }
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Time Zone"
              name="timeZone"
              rules={ [{ required: true, message: 'Please input time zone!' }] }
            >
              <Input placeholder="e.g., GMT+5:30, EST, PST" />
            </Form.Item>

            <Form.Item
              label="City"
              name="city"
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="State/Region"
              name="stateRegion"
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Country"
              name="country"
            >
              <Select
                placeholder="Select Country"
                showSearch
                allowClear
              >

                { country?.map((item, index) => (
                  <Option
                    key={ index }
                    value={ item?.name }
                    style={ { textTransform: "capitalize" } }
                  >
                    { item?.name }
                  </Option>
                )) }
              </Select>
            </Form.Item>

            <Form.Item
              label="Postal Code"
              name="postalCode"
              rules={ [
                { pattern: /^[0-9]+$/, message: 'Please enter numbers only!' }
              ] }
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Number of Employees"
              name="numberOfEmployees"
              rules={ [
                { pattern: /^[0-9]+$/, message: 'Please enter numbers only!' }
              ] }
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Annual Revenue"
              name="annualRevenue"
              rules={ [
                { pattern: /^[0-9]+$/, message: 'Please enter numbers only!' }
              ] }
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Web Technologies"
              name="webTechnologies"
            >
              <Select
                mode="multiple"
                placeholder="Select Web Technologies"
              >
                { webTechnologies.map(tech => (
                  <Select.Option key={ tech } value={ tech }>
                    { tech }
                  </Select.Option>
                )) }
              </Select>
            </Form.Item>

            <Form.Item
              label="LinkedIn Company Page"
              name="linkedinPage"
              rules={ [
                { type: 'url', message: 'Please enter a valid LinkedIn URL!' }
              ] }
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Currency"
              name="Currency"
              rules={ [{ required: true, message: 'Please select a currency!' }] }
            >
              <Select
                showSearch
                placeholder="Select Currency"
                style={ { width: '100%' } }
              >
                { currenciesData.map(currency => (
                  <Select.Option
                    key={ currency.code }
                    value={ currency.code }
                  >
                    <span style={ { fontWeight: 500 } }>{ currency.code }</span>
                    <span style={ { color: '#666', marginLeft: 8 } }>{ currency.name }</span>
                  </Select.Option>
                )) }
              </Select>
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              className="full-width"
              style={ { gridColumn: '1 / -1' } }
            >
              <TextArea rows={ 4 } />
            </Form.Item>
          </div>
        </div>
        <Divider />

        <div style={ { display: 'flex', justifyContent: 'flex-end', gap: '8px' } }>
          <Button onClick={ onCancel } className='text-btn '>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={ loading }>
            { editId ? "Update Company" : "Save Company" }
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CompanyFormModal;