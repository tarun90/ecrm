import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import { Search } from "lucide-react";
import "../../components/custome.css";
import "./Invoice.css";
import elsnerLogo from "/elsner_logo.png";
import currenciesData from '../Company/currency';
import {
  Layout,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Pagination
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [sales, setSales] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null); // Column to sort
  // 🔹 Additional filter states
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // asc or desc
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [size, setSize] = useState("large");
  const [totalItems, setTotalItems] = useState(0);
  const initialFormData = {
    invoice_number: "",
    contact: "",
    due_date: "",
    items: [],
    subtotal: "",
    tax_amount: "",
    discount_amount: "",
    grand_total: "",
    payment_status: "unpaid",
    payment_mode: "credit_card",
    currency: "USD",
    notes: "",
    termsConditions: "",
    signature: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchSales();
    fetchInvoices();
    fetchContacts();
    fetchProducts();
  }, [currentPage, pageSize]);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_TM_API_URL}/api/contacts`
      );
      setContacts(response.data);
    } catch (err) {
      setError("Failed to fetch contacts. Please try again later.");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_TM_API_URL}/api/products`
      );
      setProducts(response.data);
    } catch (err) {
      setError("Failed to fetch products. Please try again later.");
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_TM_API_URL}/api/invoices?page=${currentPage}&pageSize=${pageSize}`
      );
      setInvoices(response.data.data);
      setTotalItems(response.data.total);
    } catch (err) {
      setError("Failed to fetch invoices. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_TM_API_URL}/api/sales?page=${currentPage}`
      );
      setSales(response.data);
    } catch (err) {
      setError("Failed to fetch sales. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (invoiceId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_TM_API_URL}/api/invoices/${invoiceId}`
      );
      setInvoices(invoices.filter((invoice) => invoice._id !== invoiceId));
    } catch (error) {
      setError("Failed to delete invoice. Please try again.");
      console.error("Error deleting invoice:", error);
    }
  };

  const deleteMultipleInvoices = async () => {
    if (selectedInvoices.length === 0) {
      setError("Please select at least one invoice to delete.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_TM_API_URL}/api/invoices/delete-multiple`,
        { invoiceIds: selectedInvoices }
      );
      setInvoices(
        invoices.filter((invoice) => !selectedInvoices.includes(invoice._id))
      );
      setSelectedInvoices([]); // Clear selection after deletion
    } catch (error) {
      setError("Failed to delete selected invoices. Please try again.");
      console.error("Error deleting multiple invoices:", error);
    }
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();
    setLoading(true);
    setError(null);

    const { contact, invoice_number, due_date, items } = formData;

    if (!contact || !invoice_number || !due_date) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }

    if (items.length === 0 || items.some((item) => !item.product)) {
      setError(
        "Please select a product for all added line items before creating an invoice."
      );
      setLoading(false);
      return;
    }

    // 🔹 Find selected contact details from `contacts` list
    const selectedContact = contacts.find((c) => c._id === contact);

    const selectedSales = sales.find((c) => c._id === sales);

    // 🔹 Append `customer` field to `formData`
    const updatedFormData = {
      ...formData,
      customer: selectedContact
        ? `${selectedContact.firstName} ${selectedContact.lastName}`
        : "Unknown Customer", // Default if not found
      sales: selectedSales
    };


    try {
      if (isEditing && currentInvoice) {
        await axios.put(
          `${import.meta.env.VITE_TM_API_URL}/api/invoices/${
            currentInvoice._id
          }`,
          updatedFormData
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_TM_API_URL}/api/invoices`,
          updatedFormData
        );
      }
      setIsModalOpen(false);
      setFormData(initialFormData);
      fetchInvoices();
    } catch (error) {
      setError("Failed to save invoice. Please try again.");
      console.error("Error saving invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (index, selectedProductId) => {
    const selectedProduct = products.find((p) => p._id === selectedProductId);
    if (selectedProduct) {
      const updatedItems = formData?.items?.map((item, i) =>
        i === index
          ? {
              ...item,
              product: selectedProduct?._id,
              product_name: selectedProduct?.name,
              unit_price: selectedProduct?.unit_cost?.toString(),
              tax_rate: selectedProduct?.tax_rate?.toString(),
            }
          : item
      );

      setFormData({ ...formData, items: updatedItems }); // Update the state correctly
      calculateTotals(updatedItems);
    }
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      return sum + quantity * unitPrice;
    }, 0);

    const taxAmount = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;
      const itemTotal = quantity * unitPrice;
      return sum + (itemTotal * taxRate) / 100;
    }, 0);

    const discountAmount = parseFloat(formData.discount_amount) || 0;
    const grandTotal = subtotal + taxAmount - discountAmount;

    setFormData({
      ...formData,
      items,
      subtotal: subtotal.toFixed(2),
      tax_amount: taxAmount.toFixed(2),
      grand_total: grandTotal.toFixed(2),
    });
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = formData.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };

        if (field === "quantity" || field === "unit_price") {
          const quantity =
            field === "quantity"
              ? parseFloat(value) || 0
              : parseFloat(item.quantity) || 0;
          const unitPrice =
            field === "unit_price"
              ? parseFloat(value) || 0
              : parseFloat(item.unit_price) || 0;
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
      grand_total: grandTotal.toFixed(2),
    });
  };

  const addLineItem = () => {
    const newItem = {
      product: "",
      product_name: "",
      quantity: "",
      unit_price: "",
      tax_rate: "",
      total_price: "",
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
  };

  const removeLineItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    calculateTotals(updatedItems);
  };

  const handleNewInvoice = () => {
    setIsEditing(false);
    setFormData({
      ...initialFormData,
      items: [
        {
          product: "",
          product_name: "",
          quantity: "",
          unit_price: "",
          tax_rate: "",
          total_price: "",
        },
      ], // Add default line item only when creating a new invoice
    });
    setIsModalOpen(true);
  };

  const handleEdit = (invoice) => {
    setIsEditing(true);
    const formattedInvoice = {
      ...invoice,
      due_date: dayjs(),
      contact: invoice.contact?._id || "",
      subtotal: invoice.subtotal?.toString() || "",
      tax_amount: invoice.tax_amount?.toString() || "",
      discount_amount: invoice.discount_amount?.toString() || "",
      grand_total: invoice.grand_total?.toString() || "",
      items: invoice.items?.length
        ? invoice.items.map((item) => ({
            ...item,
            quantity: item.quantity?.toString() || "",
            unit_price: item.unit_price?.toString() || "",
            total_price: item.total_price?.toString() || "",
            tax_rate: item.tax_rate?.toString() || "",
          }))
        : [],
    };

    setCurrentInvoice(invoice);
    setFormData(formattedInvoice);
    setIsModalOpen(true);
  };

  /** Function to Format Date from ISO to DD/MM/YYYY */
  const formatDate = (isoString) => {
    if (!isoString) return "N/A"; // Default if date is missing
    const dateObj = new Date(isoString);
    const day = String(dateObj.getUTCDate()).padStart(2, "0");
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = dateObj.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const exportPDF = () => {
    if (selectedInvoices.length === 0) {
      setError("Please select at least one invoice to export.");
      return;
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    selectedInvoices.forEach((invoiceId, index) => {
      const invoice = invoices.find((inv) => inv._id === invoiceId);
      if (!invoice) return;

      if (index > 0) doc.addPage();

      let yPos = 15;

      /** 🔹 LOGO + SERVICE PROVIDER DETAILS (Properly Aligned) */
      const logoSize = 25;
      const marginLeft = 20;
      const maxTextWidth = 90; // Ensures the address fits properly
      const logoY = 15;

      // Draw Logo (Left Aligned)
      doc.addImage(elsnerLogo, "PNG", marginLeft, logoY, logoSize, logoSize);

      // Company Name (Bold, Left-Aligned)
      const companyY = logoY + logoSize + 5;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Elsner Technologies Pvt Ltd", marginLeft, companyY);

      // Address (Smaller, Left-Aligned with Proper Width)
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const addressText = `
3150 McGavock Pk, Nashville, Tennessee, 37214, US
(555) 555-5555 | hello@serviceprovider.com
`;

      doc.text(
        doc.splitTextToSize(addressText, maxTextWidth),
        marginLeft,
        companyY + 6
      );

      // Adjust yPos after address for proper spacing before recipient section
      yPos = companyY + 20;
      /** 🔹 FIND CONTACT DETAILS */
      const selectedContact = contacts.find(
        (c) => c._id === invoice?.contact?._id
      );
      const customerPhone = selectedContact
        ? selectedContact.phoneNumber
        : "No Phone Number";

      /** 🔹 RECIPIENT DETAILS */
      const recipientY = yPos + 10;
      doc.setFont("helvetica", "bold");
      doc.text("RECIPIENT:", marginLeft, recipientY);

      // Customer Name (Fetched from Invoice)
      const customerName = invoice.customer || "Unknown Customer"; // Default if missing

      // Display Customer Name
      doc.setFont("helvetica", "bold");
      doc.text(customerName, marginLeft, recipientY + 6);

      // Display Phone Number from Contact
      doc.setFont("helvetica", "normal");
      doc.text(`Phone: ${customerPhone}`, marginLeft, recipientY + 12);

      /** 🔹 INVOICE DETAILS BOX (Aligned with Correct Colors) */
      const invoiceBoxWidth = 90;
      const invoiceBoxX = pageWidth - marginLeft - invoiceBoxWidth;

      /** 🟦 Invoice Header (Dark Blue Background) */
      doc.setFillColor(0, 39, 66); // Dark blue
      doc.rect(invoiceBoxX, recipientY, invoiceBoxWidth, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Invoice #${invoice.invoice_number || "1058"}`,
        invoiceBoxX + 5,
        recipientY + 7
      );

      /** 🔹 Issued & Due Section (Gray Background) */
      doc.setFillColor(230, 230, 230); // Light gray
      doc.rect(invoiceBoxX, recipientY + 10, invoiceBoxWidth, 12, "F");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      const rightAlignX = invoiceBoxX + invoiceBoxWidth - 5;
      const leftTextX = invoiceBoxX + 5;

      doc.text("Issued:", leftTextX, recipientY + 15);
      doc.text(
        formatDate(invoice.createdAt) || "2024-02-19",
        rightAlignX,
        recipientY + 15,
        { align: "right" }
      );

      doc.text("Due:", leftTextX, recipientY + 21);
      doc.text(
        formatDate(invoice.due_date) || "19/03/2024", // Default formatted date
        rightAlignX,
        recipientY + 21,
        { align: "right" }
      );

      /** 🟦 Total Box (Dark Blue Background) */
      doc.setFillColor(0, 39, 66); // Dark blue
      doc.rect(invoiceBoxX, recipientY + 22, invoiceBoxWidth, 10, "F");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(`Total`, leftTextX, recipientY + 28);
      doc.text(
        `${invoice.currency || "USD"}${parseFloat(
          invoice.grand_total || 0
        ).toFixed(2)}`,
        rightAlignX,
        recipientY + 28,
        { align: "right" }
      );

      yPos = recipientY + 45; // Adjust spacing before table

      /** 🔹 SERVICES TABLE */
      doc.autoTable({
        startY: yPos,
        head: [
          ["PRODUCT / SERVICE", "DESCRIPTION", "QTY.", "UNIT PRICE", "TOTAL"],
        ],
        body: invoice.items.map((item) => [
          item.product_name || "Materials",
          item.description || "Required materials for completing service",
          item.quantity || 1,
          `${invoice.currency || "$"}${(item.unit_price || 300).toFixed(2)}`,
          `${invoice.currency || "$"}${(item.total || 300).toFixed(2)}`,
        ]),
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [0, 39, 66], textColor: [255, 255, 255] },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      /** 🔹 SUMMARY BOX */
      const summaryWidth = 90;
      const summaryX = pageWidth - margin - summaryWidth;
      doc.roundedRect(summaryX, yPos, summaryWidth, 40, 3, 3, "D");

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      const addSummaryLine = (label, value, y, bold = false) => {
        if (bold) doc.setFont("helvetica", "bold");
        doc.text(label, summaryX + 10, y);
        doc.text(value, summaryX + summaryWidth - 10, y, { align: "right" });
        if (bold) doc.setFont("helvetica", "normal");
      };

      addSummaryLine(
        "Subtotal:",
        `${invoice.currency || "$"}${parseFloat(
          invoice.subtotal || 780
        ).toFixed(2)}`,
        yPos + 10
      );
      addSummaryLine(
        "Tax Rate (13%):",
        `${invoice.currency || "$"}${parseFloat(
          invoice.tax_amount || 101.4
        ).toFixed(2)}`,
        yPos + 20
      );
      addSummaryLine(
        "Total:",
        `${invoice.currency || "$"}${parseFloat(
          invoice.grand_total || 881.4
        ).toFixed(2)}`,
        yPos + 30,
        true
      );

      // Move yPos below the Summary Box
      yPos += 50;

      /** 🔹 NOTES SECTION (Now Below Summary) */
      if (invoice.notes) {
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 15, 3, 3, "D");

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Notes:", margin + 5, yPos + 6);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(
          doc.splitTextToSize(invoice.notes, pageWidth - margin * 2 - 10),
          margin + 5,
          yPos + 12
        );

        yPos += 20; // Ensure spacing before footer
      }

      /** 🔹 FOOTER (Remains at Bottom) */
      const summaryBottomY = yPos + 20;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Thanks for your business!", margin, summaryBottomY);
    });

    doc.save(`Invoice_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    // Convert all values to lowercase for case-insensitive matching
    const invoiceNumberMatch =
      invoiceFilter === "" ||
      invoice.invoice_number.toString().includes(invoiceFilter.toString());

    const customerName =
      invoice.contact?.firstName + " " + invoice.contact?.lastName;
    const customerMatch =
      customerFilter === "" ||
      customerName?.toLowerCase().includes(customerFilter.toLowerCase());

    const dueDateMatch =
      dueDateFilter === "" ||
      new Date(invoice.due_date).toLocaleDateString().includes(dueDateFilter);

    const statusMatch =
      statusFilter === "" ||
      invoice.payment_status.toLowerCase() === statusFilter.toLowerCase();

    // Ensure search term is applied across relevant fields
    const searchMatch =
      searchTerm === "" ||
      invoice.invoice_number.toString().includes(searchTerm) ||
      customerName?.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      invoiceNumberMatch &&
      customerMatch &&
      dueDateMatch &&
      statusMatch &&
      searchMatch
    );
  });

  // 🔹 Sort Invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue, bValue;
    switch (sortColumn) {
      case "invoice_number":
        aValue = a.invoice_number;
        bValue = b.invoice_number;
        break;
      case "customer":
        aValue = a.contact?.firstName + " " + a.contact?.lastName;
        bValue = b.contact?.firstName + " " + b.contact?.lastName;
        break;
      case "due_date":
        aValue = new Date(a.due_date);
        bValue = new Date(b.due_date);
        break;
      case "status":
        aValue = a.payment_status;
        bValue = b.payment_status;
        break;
      default:
        return 0;
    }
    return sortOrder === "asc"
      ? aValue > bValue
        ? 1
        : -1
      : aValue < bValue
      ? 1
      : -1;
  });

  // 🔹 Handle Sorting Toggle
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  return (
    <Layout className="main-content-wrapper">
      <div className="invoice-header">
        <div className="search-container">
          <div className="filter-container">
            <div className="filter-group">
              <div className="search-bar">
                <Search className="search-icon-invoice" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input"
                />
              </div>
              {/* 📑 Filter by Invoice Number */}
              <input
                type="text"
                placeholder="Invoice Number..."
                value={invoiceFilter}
                onChange={(e) => setInvoiceFilter(e.target.value)}
                className="filter-input"
              />

              {/* 🧑‍💼 Filter by Customer */}
              <input
                type="text"
                placeholder="Customer Name..."
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="filter-input"
              />

              {/* 📅 Filter by Due Date */}
              <input
                type="text"
                placeholder="Due Date (DD/MM/YYYY)..."
                value={dueDateFilter}
                onChange={(e) => setDueDateFilter(e.target.value)}
                className="filter-input"
              />

              {/* 📌 Filter by Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-dropdown"
              >
                <option value="">All Statuses</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* 🔄 Clear Filters Button */}
            <button
              className="clear-filters"
              onClick={() => {
                setSearchTerm("");
                setInvoiceFilter("");
                setCustomerFilter("");
                setDueDateFilter("");
                setStatusFilter("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
        <div className="action-buttons">
          <Button
            onClick={exportPDF}
            disabled={selectedInvoices.length === 0}
            icon={<DownloadOutlined />}
            size={size}
            type="primary"
            className="export-invoice"
          >
            Export Selected
          </Button>
          <Button
            onClick={deleteMultipleInvoices}
            disabled={selectedInvoices.length === 0}
            type="danger"
            icon={<DeleteOutlined />}
            className="delete-btn"
          >
            Delete Selected
          </Button>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={handleNewInvoice}
            className="new-invoice"
          >
            New Invoice
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="contact-table">
          <table>
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    className="checkbox-select-all"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedInvoices(
                          sortedInvoices.map((invoice) => invoice._id)
                        );
                      } else {
                        setSelectedInvoices([]);
                      }
                    }}
                  />
                </th>
                <th onClick={() => handleSort("invoice_number")}>
                  Invoice Number{" "}
                  {sortColumn === "invoice_number" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("customer")}>
                  Customer{" "}
                  {sortColumn === "customer" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("due_date")}>
                  Due Date{" "}
                  {sortColumn === "due_date" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("status")}>
                  Status{" "}
                  {sortColumn === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("total")}>
                  Total{" "}
                  {sortColumn === "total" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedInvoices.length > 0 ? (
                sortedInvoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice._id)}
                        onChange={() => {
                          setSelectedInvoices((prev) =>
                            prev.includes(invoice._id)
                              ? prev.filter((id) => id !== invoice._id)
                              : [...prev, invoice._id]
                          );
                        }}
                        className="checkbox-select"
                      />
                    </td>
                    <td>{invoice.invoice_number}</td>
                    <td>
                      {invoice.contact
                        ? `${invoice.contact.firstName} ${invoice.contact.lastName}`
                        : "Unknown Customer"}
                    </td>
                    <td>{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td className={`status ${invoice.payment_status}`}>
                      {invoice.payment_status}
                    </td>
                    <td>
                      {invoice.currency} {invoice.grand_total}
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteInvoice(invoice._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <InvoiceForm
          isEditing={isEditing}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          formData={formData}
          contacts={contacts}
          sales={sales}
          currenciesData={currenciesData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          addLineItem={addLineItem}
          removeLineItem={removeLineItem}
          handleLineItemChange={handleLineItemChange}
          handleProductSelect={handleProductSelect}
          handleDiscountChange={handleDiscountChange}
          products={products}
          loading={loading}
        />
      )}

    <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={totalItems}
        onChange={(page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
            fetchSales();
        }}
        showSizeChanger
        pageSizeOptions={['10', '20', '50', '100']}
    />
    </Layout>
  );
}

export default Invoices;

const InvoiceForm = ({
  isEditing,
  isModalOpen,
  setIsModalOpen,
  formData,
  sales,
  currenciesData,
  contacts,
  setFormData,
  handleSubmit,
  addLineItem,
  removeLineItem,
  handleLineItemChange,
  handleProductSelect,
  handleDiscountChange,
  products,
  loading,
}) => {
  return (
    <Modal
      title={isEditing ? "Edit Invoice" : "Create New Invoice"}
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={null}
    >
      <Form layout="vertical" onFinish={handleSubmit} initialValues={formData}>
        <div className="modal-content scroll">
          <Form.Item
            onChange={(value) =>
              setFormData({ ...formData, invoice_number: value.target.value })
            }
            label="Invoice Number"
            name="invoice_number"
            rules={[{ required: true }]}
          >
            <Input placeholder="Invoice Number" />
          </Form.Item>

          <Form.Item
            label="Sales Number"
            name="sales_number"
            rules={[{ required: true, message: "Customer Name is required" }]}
          >
            <Select
              showSearch
              placeholder="Select Sales"
              value={formData.sales_number || null}
              onChange={(value) => setFormData({ ...formData, sales_number: value })}
              className="searchable-dropdown"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {sales.map((sales_numbers) => (
                <Select.Option key={sales_numbers.sales_number} value={sales_numbers.sales_number}>
                  {`SO-${sales_numbers.sales_number}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Customer Name"
            name="contact"
            rules={[{ required: true, message: "Customer Name is required" }]}
          >
            <Select
              showSearch
              placeholder="Select Customer"
              value={formData.contact || null}
              onChange={(value) => setFormData({ ...formData, contact: value })}
              className="searchable-dropdown"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {contacts.map((contact) => (
                <Select.Option key={contact._id} value={contact._id}>
                  {`${contact.firstName} ${contact.lastName}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Due Date"
            name="due_date"
            rules={[{ required: true, message: "Due Date is required" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              value={
                formData.due_date
                  ? dayjs(formData.due_date, "YYYY-MM-DD")
                  : null
              } // Ensure proper parsing
              onChange={(date, dateString) => {
                setFormData({ ...formData, due_date: dateString || null }); // Store as string
              }}
            />
          </Form.Item>
          <Form.Item label="Payment Status" name="payment_status">
            <Select
              value={formData.payment_status} // Ensure the selected value is shown
              onChange={(value) =>
                setFormData({ ...formData, payment_status: value })
              }
            >
              <Select.Option value="unpaid">Unpaid</Select.Option>
              <Select.Option value="paid">Paid</Select.Option>
              <Select.Option value="partially_paid">
                Partially Paid
              </Select.Option>
              <Select.Option value="overdue">Overdue</Select.Option>
            </Select>
          </Form.Item>

          <div className="line-items">
            <h3>Line Items</h3>
            <Button
              type="dashed"
              className="export-btn"
              htmlType="button"
              onClick={addLineItem}
            >
              Add Item
            </Button>
          </div>
          {formData.items.map((item, index) => (
            <div key={index} className="item-wrapper">
              <Form.Item label="Select Product">
                <Select
                  showSearch
                  placeholder="Search Product"
                  optionFilterProp="children"
                  value={formData.items[index]?.product || null} // Ensure selected value is set
                  filterOption={(input, option) =>
                    option?.children
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={(value) => handleProductSelect(index, value)}
                >
                  {products.map((product) => (
                    <Select.Option key={product._id} value={product._id}>
                      {`${product.name} - ${product.currency} ${product.unit_cost} (Tax: ${product.tax_rate}%)`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <div className="line-items-wrapper">
                <Form.Item label="Quantity">
                  <InputNumber
                    min={1}
                    value={item.quantity}
                    onChange={(value) =>
                      handleLineItemChange(index, "quantity", value)
                    }
                    disabled={!item.product}
                  />
                </Form.Item>

                <Form.Item label="Unit Price">
                  <InputNumber
                    min={0}
                    step={0.01}
                    value={item.unit_price}
                    onChange={(value) =>
                      handleLineItemChange(index, "unit_price", value)
                    }
                    disabled={!item.product}
                  />
                </Form.Item>

                <Form.Item label="Total Price">
                  <InputNumber value={item.total_price} readOnly />
                </Form.Item>
              </div>
              <Button
                type="link"
                className="delete-btn"
                onClick={() => removeLineItem(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <div className="line-items-wrapper">
            <Form.Item label="Subtotal">
              <InputNumber value={formData.subtotal} readOnly />
            </Form.Item>

            <Form.Item label="Tax Amount">
              <InputNumber value={formData.tax_amount} readOnly />
            </Form.Item>

            <Form.Item label="Discount Amount">
              <InputNumber
                min={0}
                step={0.01}
                value={formData.discount_amount}
                onChange={handleDiscountChange}
              />
            </Form.Item>

            <Form.Item label="Grand Total">
              <InputNumber value={formData.grand_total} readOnly />
            </Form.Item>
          </div>
          <Form.Item
            label="Currency"
            name="currency"
            rules={[{ required: true, message: 'Please select a currency!' }]}
          >
            <Select
              showSearch
              placeholder="Select Currency"
              style={{ width: '100%' }}
              onChange={(value) =>
                setFormData({ ...formData, currency: value })
              }
            >
              {currenciesData.map(currency => (
                <Select.Option
                  key={currency.code}
                  value={currency.code}
                >
                  <span style={{ fontWeight: 500 }}>{currency.code}</span>
                  <span style={{ color: '#666', marginLeft: 8 }}>{currency.name}</span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Notes">
            <Input.TextArea
              rows={2}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item label="Terms and Conditions">
            <Input.TextArea
              rows={2}
              value={formData.termsConditions}
              onChange={(e) =>
                setFormData({ ...formData, termsConditions: e.target.value })
              }
            />
          </Form.Item>
        </div>
        <div className="modal-footer">
          <Form.Item>
            <Button className="text-btn" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Invoice"
                : "Create Invoice"}
            </Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
