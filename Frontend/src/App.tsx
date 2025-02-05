import React from 'react';
import { useState } from 'react';
import Products from './components/Products';
import Invoices from './components/Invoices';
import { CircleUser, FileText, Package } from 'lucide-react';
import "./components/custome.css"
function App() {
  const [activeTab, setActiveTab] = useState<'products' | 'invoices'>('products');

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Header */}
      {/* <header className="bg-white shadow-sm buisiness-main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <CircleUser className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900 head-text">Business Manager</span>
            </div>
          </div>
        </div>
      </header> */}

      {/* Navigation Tabs */}
      <div className=" buisness-manage-container">
        <div className="border-b border-gray-200 side-bar-navicon">
          <nav className="-mb-px flex space-x-8 nav-bar-items">
            <h2><a href="#">DM</a></h2>
            <button
              onClick={() => setActiveTab('products')}
              className={`${
                activeTab === 'products'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent product-btn text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Package className="mr-2 h-5 w-5" />
            
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`${
                activeTab === 'invoices'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent invoice-btn text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FileText className="mr-2 h-5 w-5" />
              
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="py-6 products-content">
          {activeTab === 'products' ? <Products /> : <Invoices />}
        </div>
      </div>
    </div>
  );
}

export default App;