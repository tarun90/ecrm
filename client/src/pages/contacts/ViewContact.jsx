// Full Final Code with Axios for API Calls
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Plus, ArrowLeft, Mail, Phone, Copy } from 'lucide-react';
import { Button ,message} from 'antd';
import { CaretDownOutlined, EditOutlined } from '@ant-design/icons';
import './ViewContact.css';
import { useParams,useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_TM_API_URL;
// API Call Function with Axios
const getContacts = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/contacts/view/${id}`);
    // console.log(response.data.contactOwner.name);
    return response.data;
  } catch (error) {
    console.error('Error fetching contact:', error);
    return null;
  }
};

const getDeals = async (id,companyId) => {
  try {
    const response = await axios.get(`${API_URL}/api/contacts/deals/${id}/${companyId}`);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching deals:', error);
    return null;
  }
};

const getCompanies = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/company`);
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
};

// Function to Get Initials from Name
const getInitials = (firstName, lastName) => (
  `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'N/A'
);

// Function to Copy to Clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  message.success('Copied to clipboard!');
};

// Function to Open Mailbox in Chrome
const openMailClient = (email) => {
  window.open(`mailto:${email}`, '_blank');
};
// Reusable Action Button Component
const ActionButton = ({ icon, label }) => (
  <div className="action-button">
    <button className="icon-button">{icon}</button>
    <span className="button-label">{label}</span>
  </div>
);

// Sidebar Component
const Sidebar = ({contact}) => {

  
  
  const navigate = useNavigate();
  

  if (!contact) return <div className="sidebar">Loading...</div>;
  const avatarText = contact.initials || getInitials(contact.firstName, contact.lastName);
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <ArrowLeft className="back-icon" onClick={() => navigate('/contacts')} style={{ cursor: 'pointer' }}/>
        <span>Contact</span>
      </div>

      <div className="contact-card scroll">
        <div className="contact-info">
          <div className="avatar">{avatarText}</div>
          <div className="contact-details">
            <h2>{contact.firstName}</h2>
            <h3>{contact.lastName}</h3>
            <Button className="email" onClick={() => copyToClipboard(contact.email)}>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
              <Copy style={{ cursor: 'pointer' }} />
            </Button>
          </div>
        </div>

        <div className="action-buttons">
          {[{ icon: <Mail />, label: 'Email',onClick: () => openMailClient(contact.email) }, { icon: <Phone />, label: 'Call' }].map((action, index) => (
            <ActionButton key={index} icon={action.icon} label={action.label} />
          ))}
        </div>

        <div className="about-section">
            <div className="about-header">
              <h3>About this contact</h3>
            </div>
            <div className="contact-fields">
                <div className="field">
                  <p className="label">Email:</p>
                  <div className="email">
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </div>
                </div>
                <div className="field">
                    <p className="label">Phone number:</p>
                    <div className="email">
                      <a href={`tel:${contact.phoneNumber}`}>{contact.phoneNumber}</a>
                    </div>
                </div>
                <div className="field">
                    <p className="label">Contact owner:</p>
                    <div className="email">
                      <a>{contact?.contactOwner?.name}</a>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Main Content Component
const MainContent = ({contactsData,deals}) => {
  
  const sections = ['Companies', 'Deals'];
  // const [companies, setCompanies] = useState([]);
  
  // useEffect(() => {
  //   const fetchCompanies = async () => {
  //     const companyList = await getCompanies();
  //     setCompanies(companyList);
  //   };
  //   fetchCompanies();
  // }, []);

  return (
    <div className="main-content">
      {sections.map((section) => (
        <div key={section} className="content-section">
          <div className="section-header">
            <h2>{section}</h2>
          </div>
          <div className="contact-table">
              {section == "Companies" ? <>
                  <table>
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Company Owner</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>City</th>
                        <th>Country</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactsData && contactsData.company && contactsData.company._id ? (
                        <tr key={contactsData.company._id}>
                          <td>{contactsData.company.companyName}</td>
                          <td>{contactsData.company.companyOwner}</td>
                          <td>{contactsData.company.phoneNumber}</td>
                          <td>{contactsData.company.email}</td>
                          <td>{contactsData.company.city}</td>
                          <td>{contactsData.company.country}</td>
                        </tr>
                      ) : (
                        <tr key="id">
                          <td colSpan="6"><center>No Companies Found</center></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>:<>
                <table>
                  <thead>
                    <tr>
                      <th>Deal Name</th>
                      <th>Deal Owner</th>
                      <th>Amount</th>
                      <th>Stage</th>
                      <th>Close Date</th>
                    </tr>
                  </thead>
                  <tbody>
                   
                  {deals?.length > 0 ? (
                    deals.map((deal, index) => (
                      <tr key={index}>
                        <td>{deal?.name}</td>
                        <td>{deal?.contact?.firstName + " " + deal?.contact?.lastName}</td>
                        <td>{deal?.amount}</td>
                        <td>{deal?.stage}</td>
                        <td>
                          {new Date(deal?.closeDate).getDate().toString().padStart(2, '0') + '-' +
                          (new Date(deal?.closeDate).getMonth() + 1).toString().padStart(2, '0') + '-' +
                          new Date(deal?.closeDate).getFullYear()}
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr key="no-deals">
                      <td colSpan="5"><center>No Deals Found</center></td>
                    </tr>
                  )}
                    
                  </tbody>
                </table>
                </>
                }
                
            </div>
        </div>
      ))}
    </div>
  );
};

// Main DealView Component
const DealView = () => {
  const [contact, setContact] = useState([]);
  const [deal, setDeal] = useState([]);
  const { id } = useParams();
  useEffect(() => {
    const fetchContact = async () => {
      const result = await getContacts(id);
      setContact(result);

      const deals = await getDeals(id,result.company._id);
      setDeal(deals);
    };
    fetchContact();
  }, [id]);
  return (
    <div className="contact-management">
      <Sidebar contact={contact} />
      <MainContent contactsData={contact} deals={deal}/>
    </div>
  );
};

export default DealView;
