// Full Final Code for Sales View Page with Axios API Calls and Company View Component

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Copy } from 'lucide-react';
import { Button, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import './SaleView.css';
import dayjs from "dayjs";
const API_URL = import.meta.env.VITE_TM_API_URL;

// API Calls
const getSale = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/sales/view/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sale:', error);
    return null;
  }
};

// Helper Functions
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  message.success('Copied to clipboard!');
};

const formatDate = (date) => {
  return date
    ? `${new Date(date).getDate().toString().padStart(2, '0')}-${(new Date(date).getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${new Date(date).getFullYear()}`
    : 'N/A';
};

// Sidebar Component
const Sidebar = ({ sale }) => {
  const navigate = useNavigate();
  if (!sale) return <div className="sidebar">Loading...</div>;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <ArrowLeft className="back-icon" onClick={ () => navigate('/sales') } style={ { cursor: 'pointer' } } />
        <span className="sidebar-title">Sale Details</span>
      </div>

      <div className="contact-card scroll">
        <div className="sale-info">
          <div className="so-number">
            <h2>{ sale.sales_number }</h2>
          </div>

          <div className="info-item">
            <span className="label">Technology:</span>
            <span className="value">{ sale.technology }</span>
          </div>

          <div className="info-item">
            <span className="label">Activities:</span>
            <span className="value">{ sale.activities }</span>
          </div>

          <div className="info-item">
            <span className="label">Status:</span>
            <span className={ `status-badge ${sale.status.toLowerCase().replace(/\s+/g, '-')}` }>
              { sale.status }
            </span>
          </div>

          <div className="info-item">
            <span className="label">Grand Total:</span>
            <span className="value">
              { sale.company?.currency || 'USD' } { sale.grand_total.toFixed(2) }
            </span>
          </div>

          <div className="info-item">
            <span className="label">Created Date:</span>
            <span className="value">
              { sale.sales_date ? dayjs(sale.sales_date).format("DD-MM-YYYY hh:mm A") : "N/A" }
            </span>
          </div>

          <div className="info-item">
            <span className="label">Last Updated:</span>
            <span className="value">
              { sale.sales_updated_date ? dayjs(sale.sales_updated_date).format("DD-MM-YYYY hh:mm A") : "N/A" }
            </span>
          </div>
        </div>
      </div>
    </div>

  );
};

// Company View Component
const CompanyView = ({ company }) => {
  if (!company) return <div className="content-section">No Company Details Found</div>;

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Company Name</th>
          <th>Owner</th>
          <th>Phone</th>
          <th>Email</th>
          <th>City</th>
          <th>Country</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{ company.companyName }</td>
          <td>{ company.companyOwner }</td>
          <td>{ company.phoneNumber }</td>
          <td>{ company.email }</td>
          <td>{ company.city }</td>
          <td>{ company.country }</td>
        </tr>
      </tbody>
    </table>
  );
};

// Deals View Component
const DealsView = ({ deals }) => (
  <table className="data-table">
    <thead>
      <tr>
        <th>Deal Name</th>
        <th>Owner</th>
        <th>Amount</th>
        <th>Stage</th>
        <th>Close Date</th>
      </tr>
    </thead>
    <tbody>
      { deals.length ? (
        deals.map((deal) => (
          <tr key={ deal._id }>
            <td>{ deal.name }</td>
            <td>{ deal.contact?.firstName } { deal.contact?.lastName }</td>
            <td>{ deal.amount }</td>
            <td>{ deal.stage }</td>
            <td>{ formatDate(deal.closeDate) }</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5" style={ { textAlign: 'center' } }>No Deals Found</td>
        </tr>
      ) }
    </tbody>
  </table>
);

// Main Content Component
const MainContent = ({ sale, deals }) => (
  <div className="main-content">
    <div className="content-section">
      <div className="section-header">
        <h2>Company Details</h2>
      </div>
      <CompanyView company={ sale?.company } />
    </div>
  </div>
);

// Main SaleView Component
const SaleView = () => {
  const [sale, setSale] = useState(null);
  const [deals, setDeals] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchSaleData = async () => {
      const saleData = await getSale(id);
      setSale(saleData);

    };

    fetchSaleData();
  }, [id]);

  return (
    <div className="sale-management">
      <Sidebar sale={ sale } />
      <MainContent sale={ sale } />
    </div>
  );
};

export default SaleView;
