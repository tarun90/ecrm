import React, { useState } from 'react';
import Products from './pages/Product/Products';
import Invoices from './pages/Invoice/Invoices';
import { CircleUser, FileText, Package } from 'lucide-react';
import './components/custome.css';

function App() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="app-container">
      {/* Header */}
      {/* <header className="header">
        <div className="container">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CircleUser className="icon" />
              <span className="title">Business Manager</span>
            </div>
          </div>
        </div>
      </header> */}

      {/* Navigation Tabs */}
      <div className="navigation-tabs-container">
        <div className="tabs-border">
          <nav className="tabs-nav">
            <h2><a href="#">DM</a></h2>
            <button
              onClick={() => setActiveTab('products')}
              className={`${
                activeTab === 'products'
                  ? 'active-tab'
                  : 'inactive-tab'
              } tab-button`}
            >
              <Package className="icon" />
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`${
                activeTab === 'invoices'
                  ? 'active-tab'
                  : 'inactive-tab'
              } tab-button`}
            >
              <FileText className="icon" />
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {activeTab === 'products' ? <Products /> : <Invoices />}
        </div>
      </div>
    </div>
  );
}

export default App;
