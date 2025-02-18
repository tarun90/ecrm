import React from 'react';
import { Settings, Plus, ArrowLeft, Edit, Mail, Phone, Calendar, MoreHorizontal } from 'lucide-react';
import './ViewContact.css';
import { Button } from 'antd';
import { CaretDownOutlined, EditOutlined } from '@ant-design/icons';
const ActionButton = ({ icon, label }) => {
  return (
    <div className="action-button">
      <button className="icon-button">{ icon }</button>
      <span className="button-label">{ label }</span>
    </div>
  );
};

const MainContent = () => {
  const sections = ['Contacts', 'Companies', 'Deals'];

  return (
    <div className="main-content">
      { sections.map((section) => (
        <div key={ section } className="content-section">
          <div className="section-header">
            <h2>{ section }</h2>
            <div className="header-actions">
              <button className="add-button add-contact-btn">
                <Plus />
                add
              </button>
              <Settings />
            </div>
          </div>
          <div className="section-content">
            <p>No associated objects of this type exist or you don't have permission to view them.</p>
          </div>
        </div>
      )) }
    </div>
  );
};

// Sidebar Component
const Sidebar = () => {
  const actions = [
    { icon: <Edit />, label: 'Note' },
    { icon: <Mail />, label: 'Email' },
    { icon: <Phone />, label: 'Call' },
    { icon: <Edit />, label: 'Task' },
    { icon: <Calendar />, label: 'Meeting' },
    { icon: <MoreHorizontal />, label: 'More' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <ArrowLeft className="back-icon" />
        <span>Contacts</span>
        <Button icon={ <CaretDownOutlined /> }>Actions </Button>
      </div>

      <div className="contact-card scroll">
        <div className="deal-card">
          <div className="deal-header">
            <h2 className="deal-title">
              Nicksbuilding.com - New Deal
            </h2>
            <Button className="edit-btn">
              <EditOutlined />
            </Button>
          </div>

          <div className="deal-content">
            <div className="field-group">
              <p className="field-label">Amount:</p>
              <p className="field-value">$50,000</p>
            </div>

            <div className="field-group">
              <p className="field-label">Close Date:</p>
              <div className="date-field export-btn">
                <Calendar className="calendar-icon" />
                <span className="field-value">02/01/2025</span>
              </div>
            </div>

            <div className="field-group">
              <p className="field-label">Stage:</p>
              <Button icon={ <CaretDownOutlined /> } className="stage-button">
                Appointment Scheduled

              </Button>
            </div>

            <div className="field-group">
              <p className="field-label">Pipeline:</p>
              <p className="pipeline-value">Xumulus Pipeline</p>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          { actions.map((action, index) => (
            <ActionButton key={ index } icon={ action.icon } label={ action.label } />
          )) }
        </div>

        <div className="about-section">
          <div className="about-header">
            <h3>About this ...</h3>
            <div className="about-actions">
              <Button icon={ <CaretDownOutlined /> }>Actions </Button>

              <Settings />
            </div>
          </div>

          <div className="contact-fields">
            <div className="field">
              <p className="label">Email</p>
              <p className="value">info.dbderrick2@aol.com</p>
            </div>
            <div className="field">
              <p className="label">Phone number</p>
            </div>
            <div className="field">
              <p className="label">Contact owner</p>
            </div>
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