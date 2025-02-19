import React from 'react';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Settings, Plus, ArrowLeft, Edit, Mail, Phone, Calendar, MoreHorizontal, Copy } from 'lucide-react';
import './DealView.css';
import axios from 'axios';

import { Button } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
const API_URL = import.meta.env.VITE_TM_API_URL;


// Function to Copy to Clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  message.success('Copied to clipboard!');
};

// Function to Open Mailbox in Chrome
const openMailClient = (email) => {
  window.open(`mailto:${email}`, '_blank');
};

const ActionButton = ({ icon, label }) => {
  return (
    <div className="action-button">
      <button className="icon-button">{ icon }</button>
      <span className="button-label">{ label }</span>
    </div>
  );
};

const MainContent = ({DealsData}) => {
  const sections = ['Contacts', 'Companies'];

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
                    {DealsData && DealsData.company && DealsData.company._id ? (
                        <tr key={DealsData.company._id}>
                          <td>{DealsData.company.companyName}</td>
                          <td>{DealsData.company.companyOwner}</td>
                          <td>{DealsData.company.phoneNumber}</td>
                          <td>{DealsData.company.email}</td>
                          <td>{DealsData.company.city}</td>
                          <td>{DealsData.company.country}</td>
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
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Owner</th>
                        <th>Company</th>
                        <th>Status</th>
                      </tr>
                  </thead>
                  <tbody>
                   
                  {DealsData && DealsData && DealsData._id ? (
                        <tr key={DealsData._id}>
                          <td>{DealsData.firstName+" "+DealsData.lastName}</td>
                          <td>{DealsData.email}</td>
                          <td>{DealsData.phoneNumber}</td>
                          <td>{DealsData.contactOwner.name}</td>
                          <td>{DealsData.company.companyName}</td>
                          <td>{DealsData.isActive == "false" ? "Inactive" : "Active"}</td>

                        </tr>
                      ) : (
                        <tr key="id">
                          <td colSpan="6"><center>No Contact Found</center></td>
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
const getContacts = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/contacts/view/${id}`);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching deals:', error);
    return null;
  }
};
// Sidebar Component
const Sidebar = ({deal,DealsData}) => {
  const actions = [
    // { icon: <Edit />, label: 'Note' },
    { icon: <Mail />, label: 'Email' },
    { icon: <Phone />, label: 'Call' },
    // { icon: <Edit />, label: 'Task' },
    // { icon: <Calendar />, label: 'Meeting' },
    // { icon: <MoreHorizontal />, label: 'More' }
  ];

  // const { id } = useParams(); // Get deal ID from URL
  // const [deal, setDeal] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // let token=localStorage.getItem('token');

  // const getCompanies = async (id,dealId) => {
  //   try {
  //     const response = await axios.get(`${API_URL}/api/deals/companies/${id}/${dealId}`);
      
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching deals:', error);
  //     return null;
  //   }
  // };

  

  // useEffect(() => {
  //   const fetchDeal = async () => {
  //     try {
  //       const response = await fetch(`${import.meta.env.VITE_TM_API_URL}/api/deals/${id}`,{
  //         headers:{
  //           "Authorization": `Bearer ${token}`
  //         }
  //       });
  //       if (!response.ok) throw new Error("Deal not found");
        
  //       const data = await response.json();
  //       setDeal(data);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchDeal();
  // }, [id]);

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {error}</p>;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <ArrowLeft className="back-icon" />
        <span>Deal</span>
        <Button icon={ <CaretDownOutlined /> }>Actions </Button>
      </div>

      <div className="contact-card scroll">
        <div className="contact-info">
          <div className="avatar">DB</div>
          <div className="contact-details">
            <h2>{deal?.name}</h2>
            <h3>{DealsData?.firstName+" "+DealsData?.lastName}</h3>
            <Button className="email" onClick={() => copyToClipboard(DealsData?.email)}>
              <a href={`mailto:${DealsData?.email}`}>{DealsData?.email}</a>
              <Copy />
            </Button>

          </div>
        </div>

        <div className="action-buttons">
          {[{ icon: <Mail />, label: 'Email',onClick: () => openMailClient(DealsData?.email) }, { icon: <Phone />, label: 'Call' }].map((action, index) => (
            <ActionButton key={index} icon={action.icon} label={action.label} />
          ))}
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
              <p className="label">Email:</p>
              <div className="email">
                <a href={`mailto:${DealsData?.email}`}>{DealsData?.email}</a>
              </div>
            </div>
            <div className="field">
              <p className="label">Phone number</p>
              <div className='phone'>
              <a href={`tel:${DealsData?.phoneNumber}`}>{DealsData?.phoneNumber}</a>
              </div>
            </div>
            <div className="field">
              <p className="label">Contact owner</p>
              <div className='owner'>
                <a>{DealsData?.contactOwner?.name}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DealView = () => {
  const [company, setCompany] = useState([]);
  const [contact, setContact] = useState([]);
  const [deal, setDeal] = useState(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let token=localStorage.getItem('token');
  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_TM_API_URL}/api/deals/${id}`,{
          headers:{
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error("Deal not found");
        
        const data = await response.json();
        
        const result = await getContacts(data?.contact);
        setContact(result);
        setDeal(data);
        
        //
        // const result = await getContacts(data.contact);
        // setContact(result);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [id]);
  
  // useEffect(() => {
  //   const fetchContact = async () => {
  //     console.log(deal);
  //     const result = await getContacts(deal.contact);
  //     setContact(result);

  //     // const deals = await getDeals(id,result.company._id);
  //     // setDeal(deals);
  //   };
  //   fetchContact();
  // }, [id]);
  return (
    <div className="contact-management">
      <Sidebar deal={deal} DealsData={contact}/>
      <MainContent DealsData={contact}/>
    </div>
  );
};



export default DealView; 