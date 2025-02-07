import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FileText, Plus, Download, Search } from "lucide-react";
import MainLayout from "../../components/MainLayout";
import "../../components/custome.css";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [products, setProducts] = useState([]);

  const initialFormData = {
    invoice_number: "",
    customer: "",
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
    fetchInvoices();
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_TM_API_URL}/api/products`);
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
        `${import.meta.env.VITE_TM_API_URL}/api/invoices?page=${currentPage}`
      );
      setInvoices(response.data);
    } catch (err) {
      setError("Failed to fetch invoices. Please try again later.");
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

    try {
      if (isEditing && currentInvoice) {
        await axios.put(
          `${import.meta.env.VITE_TM_API_URL}/api/invoices/${currentInvoice._id}`,
          formData
        );
      } else {
        await axios.post(`${import.meta.env.VITE_TM_API_URL}/api/invoices`, formData);
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

  const handleProductSelect = (index, productId) => {
    const selectedProduct = products.find((p) => p._id === productId);
    if (selectedProduct) {
      const updatedItems = formData.items.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            product: selectedProduct._id,
            product_name: selectedProduct.name,
            unit_price: selectedProduct.unit_cost.toString(),
            tax_rate: selectedProduct.tax_rate.toString(),
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

  const handleEdit = (invoice) => {
    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split("T")[0];
      } catch (error) {
        console.error("Error formatting date:", error);
        return "";
      }
    };

    const formattedInvoice = {
      ...invoice,
      due_date: formatDate(invoice.due_date),
      subtotal: invoice.subtotal?.toString() || "",
      tax_amount: invoice.tax_amount?.toString() || "",
      discount_amount: invoice.discount_amount?.toString() || "",
      grand_total: invoice.grand_total?.toString() || "",
      items:
        invoice.items?.map((item) => ({
          ...item,
          quantity: item.quantity?.toString() || "",
          unit_price: item.unit_price?.toString() || "",
          total_price: item.total_price?.toString() || "",
          tax_rate: item.tax_rate?.toString() || "",
        })) || [],
    };

    setCurrentInvoice(invoice);
    setFormData(formattedInvoice);
    setIsEditing(true);
    setIsModalOpen(true);
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

      let yPos = 20;

      /** HEADER SECTION **/
      doc.setFillColor(255, 255, 255); // Set full white background
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(30, 64, 175); // Indigo color
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", margin, yPos);

      // REMOVED LOGO BOX
      // If you want a logo, add `doc.addImage(base64Logo, 'PNG', pageWidth - margin - 30, yPos - 10, 30, 30);`

      yPos += 20;

      /** INVOICE DETAILS **/
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      const detailsBoxWidth = 80;

      // Invoice Box (Changed Fill Color to White)
      doc.setDrawColor(200, 200, 200); // Border only
      doc.setFillColor(255, 255, 255); // White background
      doc.roundedRect(margin, yPos, detailsBoxWidth, 40, 3, 3, "D"); // Removed fill

      doc.text("Invoice No:", margin + 5, yPos + 10);
      doc.setFont("helvetica", "bold");
      doc.text(invoice.invoice_number, margin + 40, yPos + 10);
      doc.setFont("helvetica", "normal");
      doc.text("Date:", margin + 5, yPos + 20);
      doc.text(
        new Date(invoice.due_date).toLocaleDateString(),
        margin + 40,
        yPos + 20
      );

      // Customer Box (Changed Fill Color to White)
      doc.roundedRect(
        pageWidth - margin - detailsBoxWidth,
        yPos,
        detailsBoxWidth,
        40,
        3,
        3,
        "D"
      ); // No fill
      doc.text("Bill To:", pageWidth - margin - detailsBoxWidth + 5, yPos + 10);
      doc.setFont("helvetica", "bold");
      doc.text(
        invoice.customer,
        pageWidth - margin - detailsBoxWidth + 5,
        yPos + 20
      );
      doc.setFont("helvetica", "normal");
      doc.text(
        "Due Date:",
        pageWidth - margin - detailsBoxWidth + 5,
        yPos + 30
      );
      doc.text(
        new Date(invoice.due_date).toLocaleDateString(),
        pageWidth - margin - detailsBoxWidth + 50,
        yPos + 30
      );

      yPos += 50;

      /** ITEMS TABLE **/
      doc.autoTable({
        startY: yPos,
        // head: [['Product', 'Qty', 'Unit Price', 'Tax %', 'Tax Amount', 'Total']],
        head: [["Product", "Qty", "Unit Price", "Total"]],
        body: invoice.items.map((item) => {
          const taxRate = parseFloat(item.tax_amount) || 0;
          const quantity = parseFloat(item.quantity) || 0;
          const unitPrice = parseFloat(item.unit_price) || 0;
          const taxAmount = (unitPrice * quantity * taxRate) / 100;
          const total = unitPrice * quantity + taxAmount;

          return [
            item.product_name || "N/A",
            quantity.toString(),
            `${invoice.currency} ${unitPrice.toFixed(2)}`,
            // `${taxRate}%`,
            // `${invoice.currency} ${taxAmount.toFixed(2)}`,
            `${invoice.currency} ${total.toFixed(2)}`,
          ];
        }),
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255] },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      /** SUMMARY BOX **/
      const summaryWidth = 100;
      const summaryX = pageWidth - margin - summaryWidth;

      // Summary Box (Changed Fill Color to White)
      doc.roundedRect(summaryX, yPos, summaryWidth, 60, 3, 3, "D");

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const addSummaryLine = (label, value, y, bold = false) => {
        if (bold) doc.setFont("helvetica", "bold");
        doc.text(label, summaryX + 10, y);
        doc.text(value, summaryX + summaryWidth - 10, y, { align: "right" });
        if (bold) doc.setFont("helvetica", "normal");
      };

      const totalTaxAmount = invoice.items.reduce((sum, item) => {
        const taxRate = parseFloat(item.tax_amount) || 0;
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        return sum + (unitPrice * quantity * taxRate) / 100;
      }, 0);

      addSummaryLine(
        "Subtotal:",
        `${invoice.currency} ${parseFloat(invoice.subtotal).toFixed(2)}`,
        yPos + 15
      );
      addSummaryLine(
        "Tax:",
        `${invoice.currency} ${parseFloat(invoice.tax_amount)}`,
        yPos + 30
      );
      addSummaryLine(
        "Discount:",
        `${invoice.currency} ${parseFloat(invoice.discount_amount).toFixed(2)}`,
        yPos + 45
      );

      doc.line(
        summaryX + 10,
        yPos + 50,
        summaryX + summaryWidth - 10,
        yPos + 50
      );
      addSummaryLine(
        "Grand Total:",
        `${invoice.currency} ${parseFloat(invoice.grand_total).toFixed(2)}`,
        yPos + 55,
        true
      );

      yPos += 80;

      /** TERMS & NOTES **/
      if (invoice.termsConditions || invoice.notes) {
        doc.roundedRect(margin, yPos, pageWidth - margin * 2, 40, 3, 3, "D");

        if (invoice.termsConditions) {
          doc.setFontSize(10);
          doc.text("Terms & Conditions:", margin + 5, yPos + 10);
          doc.setFontSize(9);
          doc.text(
            doc.splitTextToSize(
              invoice.termsConditions,
              pageWidth - margin * 2 - 10
            ),
            margin + 5,
            yPos + 18
          );
        }

        if (invoice.notes) {
          const notesY = invoice.termsConditions ? yPos + 25 : yPos + 10;
          doc.setFontSize(10);
          doc.text("Notes:", margin + 5, notesY);
          doc.setFontSize(9);
          doc.text(
            doc.splitTextToSize(invoice.notes, pageWidth - margin * 2 - 10),
            margin + 5,
            notesY + 8
          );
        }
      }

      /** FOOTER **/
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Thank you for your business!",
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    });

    doc.save(`Invoice_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <MainLayout>
      <div className="invoice-section">
        <div className="invoice-header">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-invoice"
            />
          </div>
          <div className="action-buttons">
            <button
              onClick={exportPDF}
              disabled={selectedInvoices.length === 0}
              className="export-invoice"
            >
              <Download className="icon" />
              Export Selected
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(initialFormData);
                setIsModalOpen(true);
              }}
              className="new-invoice"
            >
              <Plus className="icon" />
              New Invoice
            </button>
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
          <div className="invoice-table">
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
                            invoices.map((invoice) => invoice._id)
                          );
                        } else {
                          setSelectedInvoices([]);
                        }
                      }}
                    />
                  </th>
                  <th>Invoice Number</th>
                  <th>Customer</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
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
                    <td>{invoice.customer}</td>
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
                        className="edit-button"
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
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{isEditing ? "Edit Invoice" : "Create New Invoice"}</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="close-btn"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  {/* Invoice Number */}
                  <div className="form-group">
                    <label htmlFor="invoice_number">Invoice Number *</label>
                    <input
                      id="invoice_number"
                      type="text"
                      placeholder="Invoice Number"
                      value={formData.invoice_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invoice_number: e.target.value,
                        })
                      }
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Customer Name */}
                  <div className="form-group">
                    <label htmlFor="customer">Customer Name *</label>
                    <input
                      id="customer"
                      type="text"
                      placeholder="Customer Name"
                      value={formData.customer}
                      onChange={(e) =>
                        setFormData({ ...formData, customer: e.target.value })
                      }
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Due Date */}
                  <div className="form-group">
                    <label htmlFor="due_date">Due Date *</label>
                    <input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) =>
                        setFormData({ ...formData, due_date: e.target.value })
                      }
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Payment Status */}
                  <div className="form-group">
                    <label htmlFor="payment_status">Payment Status</label>
                    <select
                      id="payment_status"
                      value={formData.payment_status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payment_status: e.target.value,
                        })
                      }
                      className="form-select"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="partially_paid">Partially Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                {/* Line Items */}
                <div className="line-items">
                  <h3>Line Items</h3>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="add-line-item"
                  >
                    Add Item
                  </button>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="line-item">
                    <div className="form-group">
                      <label>Select Product</label>
                      <select
                        value={item.product}
                        onChange={(e) =>
                          handleProductSelect(index, e.target.value)
                        }
                        className="form-select"
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name} - {product.currency}{" "}
                            {product.unit_cost} (Tax: {product.tax_rate}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleLineItemChange(index, "quantity", e.target.value)
                        }
                        className="form-input"
                        min="1"
                        disabled={!item.product} // Disable when no product is selected
                      />
                    </div>

                    <div className="form-group">
                      <label>Unit Price</label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "unit_price",
                            e.target.value
                          )
                        }
                        className="form-input"
                        min="0"
                        step="0.01"
                        disabled={!item.product} // Disable when no product is selected
                      />
                    </div>

                    <div className="form-group">
                      <label>Total Price</label>
                      <input
                        type="number"
                        value={item.total_price}
                        className="form-input"
                        readOnly
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="remove-line-item"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {/* Totals Section */}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Subtotal</label>
                    <input
                      type="number"
                      value={formData.subtotal}
                      className="form-input"
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>Tax Amount</label>
                    <input
                      type="number"
                      value={formData.tax_amount}
                      className="form-input"
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>Discount Amount</label>
                    <input
                      type="number"
                      value={formData.discount_amount}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      className="form-input"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>Grand Total</label>
                    <input
                      type="number"
                      value={formData.grand_total}
                      className="form-input"
                      readOnly
                    />
                  </div>
                </div>

                {/* Currency Section */}
                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="form-select"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="form-input"
                    rows="2"
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="form-group">
                  <label>Terms and Conditions</label>
                  <textarea
                    value={formData.termsConditions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        termsConditions: e.target.value,
                      })
                    }
                    className="form-input"
                    rows="2"
                  />
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading
                      ? "Saving..."
                      : isEditing
                        ? "Update Invoice"
                        : "Create Invoice"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Invoices;
