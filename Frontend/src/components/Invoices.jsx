import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Search } from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import "./custome.css";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [products, setProducts] = useState([]);

  const initialFormData = {
    invoice_number: '',
    customer: '',
    due_date: '',
    items: [],
    subtotal: '',
    tax_amount: '',
    discount_amount: '',
    grand_total: '',
    payment_status: 'unpaid',
    payment_mode: 'credit_card',
    currency: 'USD',
    notes: '',
    termsConditions: '',
    signature: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchInvoices();
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/products');
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products. Please try again later.');
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5001/api/invoices?page=${currentPage}`);
      setInvoices(response.data);
    } catch (err) {
      setError('Failed to fetch invoices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { customer, invoice_number, due_date, items } = formData;

    if (!customer || !invoice_number || !due_date) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    if (items.length === 0 || items.some(item => !item.product)) {
      setError('Please select a product for all added line items before creating an invoice.');
      setLoading(false);
      return;
    }

    try {
      if (isEditing && currentInvoice) {
        await axios.put(`http://localhost:5001/api/invoices/${currentInvoice._id}`, formData);
      } else {
        await axios.post('http://localhost:5001/api/invoices', formData);
      }
      setIsModalOpen(false);
      setFormData(initialFormData);
      fetchInvoices();
    } catch (error) {
      setError('Failed to save invoice. Please try again.');
      console.error('Error saving invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (index, productId) => {
    const selectedProduct = products.find(p => p._id === productId);
    if (selectedProduct) {
      const updatedItems = formData.items.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            product: selectedProduct._id,
            product_name: selectedProduct.name,
            unit_price: selectedProduct.unit_cost.toString(),
            tax_rate: selectedProduct.tax_rate.toString()
          };
        }
        return item;
      });

      calculateTotals(updatedItems);
    }
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      return sum + (quantity * unitPrice);
    }, 0);

    const taxAmount = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;
      const itemTotal = quantity * unitPrice;
      return sum + (itemTotal * taxRate / 100);
    }, 0);

    const discountAmount = parseFloat(formData.discount_amount) || 0;
    const grandTotal = subtotal + taxAmount - discountAmount;

    setFormData({
      ...formData,
      items,
      subtotal: subtotal.toFixed(2),
      tax_amount: taxAmount.toFixed(2),
      grand_total: grandTotal.toFixed(2)
    });
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = formData.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };

        if (field === 'quantity' || field === 'unit_price') {
          const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(item.quantity) || 0;
          const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : parseFloat(item.unit_price) || 0;
          updatedItem.total_price = (quantity * unitPrice).toFixed(2);
        }

        return updatedItem;
      }
      return item;
    });

    calculateTotals(updatedItems);
  };

  const handleDiscountChange = (value) => {
    const discountAmount = parseFloat(value) || 0;
    const subtotal = parseFloat(formData.subtotal) || 0;
    const taxAmount = parseFloat(formData.tax_amount) || 0;
    const grandTotal = subtotal + taxAmount - discountAmount;

    setFormData({
      ...formData,
      discount_amount: value,
      grand_total: grandTotal.toFixed(2)
    });
  };

  const addLineItem = () => {
    const newItem = {
      product: '',
      product_name: '',
      quantity: '',
      unit_price: '',
      tax_rate: '',
      total_price: ''
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
  };

  const removeLineItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    calculateTotals(updatedItems);
  };

  const handleEdit = (invoice) => {
    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formatting date:', error);
        return '';
      }
    };

    const formattedInvoice = {
      ...invoice,
      due_date: formatDate(invoice.due_date),
      subtotal: invoice.subtotal?.toString() || '',
      tax_amount: invoice.tax_amount?.toString() || '',
      discount_amount: invoice.discount_amount?.toString() || '',
      grand_total: invoice.grand_total?.toString() || '',
      items: invoice.items?.map(item => ({
        ...item,
        quantity: item.quantity?.toString() || '',
        unit_price: item.unit_price?.toString() || '',
        total_price: item.total_price?.toString() || '',
        tax_rate: item.tax_rate?.toString() || ''
      })) || []
    };

    setCurrentInvoice(invoice);
    setFormData(formattedInvoice);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const exportPDF = () => {
    if (selectedInvoices.length === 0) {
      setError('Please select at least one invoice to export.');
      return;
    }
  
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
  
    selectedInvoices.forEach((invoiceId, index) => {
      const invoice = invoices.find((inv) => inv._id === invoiceId);
      if (!invoice) return;
  
      if (index > 0) doc.addPage();
  
      let yPos = 20;
  
      /** HEADER SECTION **/
      doc.setFillColor(255, 255, 255); // Set full white background
      doc.rect(0, 0, pageWidth, 40, 'F'); 
      doc.setTextColor(30, 64, 175); // Indigo color
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', margin, yPos);
  
      // REMOVED LOGO BOX
      // If you want a logo, add `doc.addImage(base64Logo, 'PNG', pageWidth - margin - 30, yPos - 10, 30, 30);`
  
      yPos += 20;
  
      /** INVOICE DETAILS **/
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
  
      const detailsBoxWidth = 80;
      
      // Invoice Box (Changed Fill Color to White)
      doc.setDrawColor(200, 200, 200); // Border only
      doc.setFillColor(255, 255, 255); // White background
      doc.roundedRect(margin, yPos, detailsBoxWidth, 40, 3, 3, 'D'); // Removed fill
  
      doc.text('Invoice No:', margin + 5, yPos + 10);
      doc.setFont('helvetica', 'bold');
      doc.text(invoice.invoice_number, margin + 40, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.text('Date:', margin + 5, yPos + 20);
      doc.text(new Date(invoice.due_date).toLocaleDateString(), margin + 40, yPos + 20);
  
      // Customer Box (Changed Fill Color to White)
      doc.roundedRect(pageWidth - margin - detailsBoxWidth, yPos, detailsBoxWidth, 40, 3, 3, 'D'); // No fill
      doc.text('Bill To:', pageWidth - margin - detailsBoxWidth + 5, yPos + 10);
      doc.setFont('helvetica', 'bold');
      doc.text(invoice.customer, pageWidth - margin - detailsBoxWidth + 5, yPos + 20);
      doc.setFont('helvetica', 'normal');
      doc.text('Due Date:', pageWidth - margin - detailsBoxWidth + 5, yPos + 30);
      doc.text(new Date(invoice.due_date).toLocaleDateString(), pageWidth - margin - detailsBoxWidth + 50, yPos + 30);
  
      yPos += 50;
  
      /** ITEMS TABLE **/
      doc.autoTable({
        startY: yPos,
        // head: [['Product', 'Qty', 'Unit Price', 'Tax %', 'Tax Amount', 'Total']],
        head: [['Product', 'Qty', 'Unit Price', 'Total']],
        body: invoice.items.map((item) => {
          const taxRate = parseFloat(item.tax_amount) || 0;
          const quantity = parseFloat(item.quantity) || 0;
          const unitPrice = parseFloat(item.unit_price) || 0;
          const taxAmount = (unitPrice * quantity * taxRate) / 100;
          const total = (unitPrice * quantity) + taxAmount;
  
          return [
            item.product_name || 'N/A',
            quantity.toString(),
            `${invoice.currency} ${unitPrice.toFixed(2)}`,
            // `${taxRate}%`,
            // `${invoice.currency} ${taxAmount.toFixed(2)}`,
            `${invoice.currency} ${total.toFixed(2)}`
          ];
        }),
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255] },
        margin: { left: margin, right: margin }
      });
  
      yPos = doc.lastAutoTable.finalY + 10;
  
      /** SUMMARY BOX **/
      const summaryWidth = 100;
      const summaryX = pageWidth - margin - summaryWidth;
  
      // Summary Box (Changed Fill Color to White)
      doc.roundedRect(summaryX, yPos, summaryWidth, 60, 3, 3, 'D');
  
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
  
      const addSummaryLine = (label, value, y, bold = false) => {
        if (bold) doc.setFont('helvetica', 'bold');
        doc.text(label, summaryX + 10, y);
        doc.text(value, summaryX + summaryWidth - 10, y, { align: 'right' });
        if (bold) doc.setFont('helvetica', 'normal');
      };
  
      const totalTaxAmount = invoice.items.reduce((sum, item) => {
        const taxRate = parseFloat(item.tax_amount) || 0;
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        return sum + ((unitPrice * quantity * taxRate) / 100);
      }, 0);
  
      addSummaryLine('Subtotal:', `${invoice.currency} ${parseFloat(invoice.subtotal).toFixed(2)}`, yPos + 15);
      addSummaryLine('Tax:', `${invoice.currency} ${parseFloat(invoice.tax_amount)}`, yPos + 30);
      addSummaryLine('Discount:', `${invoice.currency} ${parseFloat(invoice.discount_amount).toFixed(2)}`, yPos + 45);
  
      doc.line(summaryX + 10, yPos + 50, summaryX + summaryWidth - 10, yPos + 50);
      addSummaryLine('Grand Total:', `${invoice.currency} ${parseFloat(invoice.grand_total).toFixed(2)}`, yPos + 55, true);
  
      yPos += 80;
  
      /** TERMS & NOTES **/
      if (invoice.termsConditions || invoice.notes) {
        doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 40, 3, 3, 'D');
  
        if (invoice.termsConditions) {
          doc.setFontSize(10);
          doc.text('Terms & Conditions:', margin + 5, yPos + 10);
          doc.setFontSize(9);
          doc.text(doc.splitTextToSize(invoice.termsConditions, pageWidth - (margin * 2) - 10), margin + 5, yPos + 18);
        }
  
        if (invoice.notes) {
          const notesY = invoice.termsConditions ? yPos + 25 : yPos + 10;
          doc.setFontSize(10);
          doc.text('Notes:', margin + 5, notesY);
          doc.setFontSize(9);
          doc.text(doc.splitTextToSize(invoice.notes, pageWidth - (margin * 2) - 10), margin + 5, notesY + 8);
        }
      }
  
      /** FOOTER **/
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for your business!', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    });
  
    doc.save(`Invoice_${new Date().toISOString().split('T')[0]}.pdf`);
  };  

  return (
    <div className="space-y-6 invoice-section">
      <div className="flex justify-between items-center invoice-header">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 search-invoice pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={exportPDF}
            disabled={selectedInvoices.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white export-invoice rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Selected
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setFormData(initialFormData);
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Invoice
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden invoice-table">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedInvoices(invoices.map(invoice => invoice._id));
                      } else {
                        setSelectedInvoices([]);
                      }
                    }}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice._id)}
                      onChange={() => {
                        setSelectedInvoices(prev =>
                          prev.includes(invoice._id)
                            ? prev.filter(id => id !== invoice._id)
                            : [...prev, invoice._id]
                        );
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${invoice.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.payment_status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                      {invoice.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.currency} {invoice.grand_total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(invoice)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Invoice Number *"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />

                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />

                  <select
                    value={formData.payment_status}
                    onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </button>
                  </div>

                  {formData.items.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-md space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <select
                          value={item.product}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name} - {product.currency} {product.unit_cost} (Tax: {product.tax_rate}%)
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          placeholder="Quantity"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="1"
                          disabled={!item.product} // Disable when no product selected
                        />

                        <input
                          type="number"
                          placeholder="Unit Price"
                          value={item.unit_price}
                          onChange={(e) => handleLineItemChange(index, 'unit_price', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="0"
                          step="0.01"
                          disabled={!item.product} // Disable when no product selected
                        />

                        <input
                          type="number"
                          placeholder="Total Price"
                          value={item.total_price}
                          className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                          readOnly
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Subtotal"
                    value={formData.subtotal}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                    readOnly
                  />

                  <input
                    type="number"
                    placeholder="Tax Amount"
                    value={formData.tax_amount}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                    readOnly
                  />

                  <input
                    type="number"
                    placeholder="Discount Amount"
                    value={formData.discount_amount}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                    disabled={formData.items.length === 0 || formData.items.some(item => !item.product)} // Disable when no product selected in any line item
                  />

                  <input
                    type="number"
                    placeholder="Grand Total"
                    value={formData.grand_total}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                    readOnly
                  />
                </div>

                <div className="space-y-4">
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>

                  <textarea
                    placeholder="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                  />

                  <textarea
                    placeholder="Terms and Conditions"
                    value={formData.termsConditions}
                    onChange={(e) => setFormData({ ...formData, termsConditions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : isEditing ? 'Update Invoice' : 'Create Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices;