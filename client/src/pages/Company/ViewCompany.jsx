import React, { useEffect, useState } from 'react';
import { Settings, Plus, ArrowLeft, Edit, Mail, Phone, Calendar, MoreHorizontal, Copy } from 'lucide-react';
import { Button, Table } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanyById } from './APIServices';
import { dealService } from '../../services/api';
import { contactService } from '../../services/api';

const ActionButton = ({ icon, label, onClick }) => {
  return (
    <div className="action-button">
      <button className="icon-button" onClick={onClick}>{ icon }</button>
      <span className="button-label">{ label }</span>
    </div>
  );
};

const MainContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const sections = ['Contacts', 'Deals'];

  useEffect(() => {
    if (id) {
      fetchRelatedData();
    }
  }, [id]);

  const fetchRelatedData = async () => {
    try {
      // Fetch contacts and deals related to this company
      const contactsData = await contactService.getAllContacts();
      const dealsData = await dealService.getAllDeals();
      
      // Filter for contacts and deals belonging to this company
      setContacts(contactsData.filter(contact => contact.company?._id === id || contact.company === id));
      setDeals(dealsData.filter(deal => deal.company?._id === id || deal.company === id));

      console.log('Deals data:', dealsData); // For debugging
      console.log('Filtered deals:', dealsData.filter(deal => deal.company?._id === id || deal.company === id)); // For debugging
    } catch (error) {
      console.error('Error fetching related data:', error);
    }
  };

  const contactColumns = [
    {
      title: 'Name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => navigate(`/contact/view/${record._id}`)}>
          {`${record.firstName} ${record.lastName}`}
        </a>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phone',
    },
    {
      title: 'Job Title',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
    },
    {
      title: 'Lead Status',
      dataIndex: 'leadStatus',
      key: 'leadStatus',
    }
  ];

  const dealColumns = [
    {
      title: 'Deal Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => navigate(`/deals/view/${record._id}`)}>
          {text}
        </a>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount?.toLocaleString() || 0}`,
    },
    {
      title: 'Stage',
      dataIndex: 'stage',
      key: 'stage',
    },
    {
      title: 'Close Date',
      dataIndex: 'closeDate',
      key: 'closeDate',
      render: (date) => new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-'),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => type === 'new' ? 'New Business' : 'Existing Business',
    }
  ];

  const renderContent = (section) => {
    const data = section === 'Contacts' ? contacts : deals;
    const columns = section === 'Contacts' ? contactColumns : dealColumns;

    if (data.length === 0) {
      return (
        <div className="section-content">
          <p>No associated {section.toLowerCase()} exist or you don't have permission to view them.</p>
        </div>
      );
    }

    return (
      <Table 
        dataSource={data} 
        columns={columns} 
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        className="section-table"
      />
    );
  };

  return (
    <div className="main-content">
      {sections.map((section) => (
        <div key={section} className="content-section">
          <div className="section-header">
            <h2>{section}</h2>
            {/* <div className="header-actions">
              <button className="add-button add-contact-btn">
                <Plus />
                add
              </button>
              <Settings />
            </div> */}
          </div>
          {renderContent(section)}
        </div>
      ))}
    </div>
  );
};

// Sidebar Component
const Sidebar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await getCompanyById(id);
        setCompany(data);
      } catch (error) {
        console.error('Error fetching company:', error);
      }
    };

    if (id) {
      fetchCompany();
    }
  }, [id]);


  const handlePhoneClick = () => {
    if (company?.phoneNumber) {
      window.open(`tel:${company.phoneNumber}`);
    }
  };

  const handleCopyEmail = (e) => {
    e.preventDefault(); // Prevent the mailto link from opening
    if (company?.email) {
      navigator.clipboard.writeText(company.email)
        .then(() => {
          // Optionally add some visual feedback that copy succeeded
          console.log('Email copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy email:', err);
        });
    }
  };

  const actions = [
    { 
      icon: <Mail />, 
      label: 'Email',
      onClick: () => window.open(`mailto:${company.email}`)
    },
    { 
      icon: <Phone />, 
      label: 'Call',
      onClick: handlePhoneClick
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <ArrowLeft className="back-icon" onClick={() => navigate('/company')} style={{ cursor: 'pointer' }} />
        <span> Company </span>
        {/* <Button icon={ <CaretDownOutlined /> }>Actions </Button> */}
      </div>

      <div className="contact-card scroll">
        <div className="contact-info">
          <div className="avatar">
            {company?.companyName?.substring(0, 2) || 'CO'}
          </div>
          <div className="contact-details">
            <h2>{company?.companyName || 'Company Name'}</h2>
            <h3>{company?.companyOwner || 'Owner Name'}</h3>
            {company?.email && (
              <Button className="email">
                <a href={`mailto:${company.email}`}>{company.email}</a>
                <Copy className="copy-icon" onClick={handleCopyEmail} style={{ cursor: 'pointer' }} />
              </Button>
            )}
          </div>
        </div>

        <div className="action-buttons">
          {actions.map((action, index) => (
            <ActionButton 
              key={index} 
              icon={action.icon} 
              label={action.label} 
              onClick={action.onClick}
            />
          ))}
        </div>

        <div className="about-section">
          {/* <div className="about-header">
            <h3>About this ...</h3>
            <div className="about-actions">
              <Button icon={ <CaretDownOutlined /> }>Actions </Button>
              <Settings />
            </div>
          </div> */}

          <div className="contact-fields">
            {company?.email && (
              <div className="field">
                <p className="label">Email</p>
                <div className="email">
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                </div>
              </div>
            )}
            {company?.phoneNumber && (
              <div className="field">
                <p className="label">Phone:</p>
                <div className="value">{company.phoneNumber}</div>
              </div>
            )}
            {company?.industry && (
              <div className="field">
                <p className="label">Industry:</p>
                <div className="value">{company.industry}</div>
              </div>
            )}
            {company?.type && (
              <div className="field">
                <p className="label">Type:</p>
                <div className="value">{company.type}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DealView = () => {
  return (
    <div className="contact-management">
      <Sidebar />
      <MainContent />
    </div>
  );
};
export default DealView; 