import React, { useState, useEffect } from "react";
import axios from "axios";
import "jspdf-autotable";
import { Search } from "lucide-react";
import "../../components/custome.css";
import currenciesData from '../Company/currency';
import {
  Layout,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Pagination
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
function Sales() {
  const [sales, setSales] = useState([]);
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [salesFilter, setSalesFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // asc or desc
  const [selectedSales, setSelectedSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSales, setCurrentSales] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const initialFormData = {
    sales_number: "",
    sales_person: "",
    contact: "",
    grand_total: "",
    activities: "",
    status: "in_progress",
    currency: "USD"
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchSales();
    fetchContacts();
    fetchActivities();
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

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_TM_API_URL}/api/sales?page=${currentPage}&pageSize=${pageSize}`
      );
      setSales(response.data.data);
      setTotalItems(response.data.total);
    } catch (err) {
      setError("Failed to fetch sales. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_TM_API_URL}/api/activities`
      );
      console.log(response.data, "activitie");
      
      setActivities(response.data);
    } catch (err) {
      setError("Failed to fetch sales. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const deleteSales = async (salesId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_TM_API_URL}/api/sales/${salesId}`
      );
      setSales(sales.filter((sales) => sales._id !== salesId));
    } catch (error) {
      setError("Failed to delete sales. Please try again.");
      console.error("Error deleting sales:", error);
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const deleteMultipleSales = async () => {
    if (selectedSales.length === 0) {
      setError("Please select at least one sales to delete.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_TM_API_URL}/api/sales/delete-multiple`,
        { salesIds: selectedSales }
      );
      setSales(
        sales.filter((sales) => !selectedSales.includes(sales._id))
      );
      setSelectedSales([]); // Clear selection after deletion
    } catch (error) {
      setError("Failed to delete selected sales. Please try again.");
      console.error("Error deleting multiple sales:", error);
    }
  };

  const handleNewSales = () => {
    setIsEditing(false);
    setFormData({
      ...initialFormData
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();
    setLoading(true);
    setError(null);

    const { contact, sales_number } = formData;

    if (!contact || !sales_number ) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }

    // 🔹 Find selected contact details from `contacts` list
    const selectedContact = contacts.find((c) => c._id === contact);

    // 🔹 Append `customer` field to `formData`
    const updatedFormData = {
      ...formData,
      customer: selectedContact
        ? `${selectedContact.firstName} ${selectedContact.lastName}`
        : "Unknown Customer", // Default if not found
    };

    try {
      if (isEditing && currentSales) {
        await axios.put(
          `${import.meta.env.VITE_TM_API_URL}/api/sales/${
            currentSales._id
          }`,
          updatedFormData
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_TM_API_URL}/api/sales`,
          updatedFormData
        );
      }
      setIsModalOpen(false);
      setFormData(initialFormData);
      fetchSales();
    } catch (error) {
      setError("Failed to save sales. Please try again.");
      console.error("Error saving sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sales) => {
    setIsEditing(true);
    const formattedInvoice = {
      ...sales,
      contact: sales.contact?._id || "",
      grand_total: sales.grand_total?.toString() || ""
    };

    setCurrentSales(sales);
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

  const filteredSales = sales.filter((sales) => {
    // Convert all values to lowercase for case-insensitive matching
    const salesNumberMatch =
      salesFilter === "" ||
      sales.sales_number.toString().includes(salesFilter.toString());

    const customerName =
      sales.contact?.firstName + " " + sales.contact?.lastName;
    const customerMatch =
      customerFilter === "" ||
      customerName?.toLowerCase().includes(customerFilter.toLowerCase());

    const statusMatch =
      statusFilter === "" ||
      sales.status.toLowerCase() === statusFilter.toLowerCase();

    // Ensure search term is applied across relevant fields
    const searchMatch =
      searchTerm === "" ||
      sales.sales_number.toString().includes(searchTerm) ||
      customerName?.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      salesNumberMatch &&
      customerMatch &&
      statusMatch &&
      searchMatch
    );
  });

  // 🔹 Sort Sales
  const sortedSales = [...filteredSales].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue, bValue;
    switch (sortColumn) {
      case "sales_number":
        aValue = a.sales_number;
        bValue = b.sales_number;
        break;
      case "sales_date":
        aValue = a.sales_date;
        bValue = b.sales_date;
        break;
    case "status":
        aValue = a.status;
        bValue = b.status;
        break;
    case "grand_total":
        aValue = a.grand_total;
        bValue = b.grand_total;
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
                  placeholder="Search sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input"
                />
              </div>
              {/* 📑 Filter by Invoice Number */}
              <input
                type="text"
                placeholder="SO Number..."
                value={salesFilter}
                onChange={(e) => setSalesFilter(e.target.value)}
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

              {/* 📌 Filter by Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-dropdown"
              >
                <option value="">All Statuses</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* 🔄 Clear Filters Button */}
            <button
              className="clear-filters"
              onClick={() => {
                setSearchTerm("");
                setSalesFilter("");
                setCustomerFilter("");
                setStatusFilter("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
        <div className="action-buttons">
          <Button
            onClick={deleteMultipleSales}
            disabled={selectedSales.length === 0}
            type="danger"
            icon={<DeleteOutlined />}
            className="delete-btn"
          >
            Delete Selected
          </Button>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={handleNewSales}
            className="new-invoice"
          >
            New Sales
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
                        setSelectedSales(
                          sortedSales.map((sales) => sales._id)
                        );
                      } else {
                        setSelectedSales([]);
                      }
                    }}
                  />
                </th>
                <th onClick={() => handleSort("sales_number")}>
                  SO Number{" "}
                  {sortColumn === "sales_number" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("sales_date")}>
                  Creation Date{" "}
                  {sortColumn === "sales_date" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("customer")}>
                  Customer{" "}
                </th>
                <th onClick={() => handleSort("activities")}>
                Activities{" "}
                </th>
                <th onClick={() => handleSort("sales_person")}>
                Sales Person{" "}
                </th>
                <th onClick={() => handleSort("grand_total")}>
                  Total{" "}
                  {sortColumn === "grand_total" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("status")}>
                  Status{" "}
                  {sortColumn === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSales.length > 0 ? (
                sortedSales.map((sales) => (
                  <tr key={sales._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedSales.includes(sales._id)}
                        onChange={() => {
                          setSelectedSales((prev) =>
                            prev.includes(sales._id)
                              ? prev.filter((id) => id !== sales._id)
                              : [...prev, sales._id]
                          );
                        }}
                        className="checkbox-select"
                      />
                    </td>
                    <td>SO-{sales.sales_number}</td>
                    <td>{formatDate(sales.sales_date)}</td>
                    <td>
                      {sales.contact
                        ? `${sales.contact.firstName} ${sales.contact.lastName}`
                        : "Unknown Customer"}
                    </td>
                    <td className={`status ${sales.activities}`}>
                      {formatStatus(sales.activities)}
                    </td>
                    <td>
                    {sales.sales_person}
                    </td>
                    <td>
                       {sales.grand_total} {sales.currency}
                    </td>
                    <td className={`status ${sales.status}`}>
                      {formatStatus(sales.status)}
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(sales)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSales(sales._id)}
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
                    No sales found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <SalesForm
          activities={activities}
          isEditing={isEditing}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          formData={formData}
          currenciesData={currenciesData}
          contacts={contacts}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
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

export default Sales;

const SalesForm = ({
  isEditing,
  isModalOpen,
  setIsModalOpen,
  formData,
  contacts,
  currenciesData,
  setFormData,
  handleSubmit,
  loading,
  activities
}) => {
  return (
    <Modal
      title={isEditing ? "Edit Sales" : "Create New Sales"}
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={null}
    >
      <Form layout="vertical" onFinish={handleSubmit} initialValues={formData}>
        <div className="modal-content scroll">
        <Form.Item
            label="SO Number"
            name="sales_number"
            rules={[
                { required: true, message: 'SO Number is required' },
                {
                pattern: /^\d{5}$/,
                message: 'SO Number must be exactly 5 digits',
                },
            ]}
            >
            <Input
                placeholder="Enter SO Number (e.g., 1 → 00001)"
                value={formData.sales_number}
                onChange={(e) => {
                const input = e.target.value.replace(/\D/g, ''); // Only digits
                if (/^\d{0,5}$/.test(input)) {
                    // Store raw number internally
                    setFormData({ ...formData, sales_number: input });
                }
                }}
                addonBefore="SO-"
            />
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
          <Form.Item label="Activitiess" name="activities">
            <Select
              value={formData.activities} // Ensure the selected value is shown
              onChange={(value) =>
                setFormData({ ...formData, activities: value })
              }
            >
              {activities.map((activitie) => (
                <Select.Option key={activitie._id} value={activitie.name}>
                  {`${activitie.name}`}
                </Select.Option>
              ))}
              {/* <Select.Option value="magento_dadicated">Magento Dadicated</Select.Option>
              <Select.Option value="seo">SEO</Select.Option>
              <Select.Option value="magento_suport_package">
              Magento Suport Package
              </Select.Option>
              <Select.Option value="suport_package">Suport Package</Select.Option> */}
            </Select>
          </Form.Item>

          <Form.Item label="Status" name="status">
            <Select
              value={formData.status} // Ensure the selected value is shown
              onChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <Select.Option value="in_progress">In Progress</Select.Option>
              <Select.Option value="on_hold">On Hold</Select.Option>
              <Select.Option value="completed">
              Completed
              </Select.Option>
            </Select>
          </Form.Item>
        
          <div className="line-items-wrapper">
            <Form.Item label="Sales Person">
              <Input value={formData.sales_person}
              onChange={(value) =>
                setFormData({ ...formData, sales_person: value.target.value })
              }
               />
            </Form.Item>
          </div>

          <div className="line-items-wrapper">
            <Form.Item label="Grand Total">
              <InputNumber value={formData.grand_total}
              onChange={(value) => {
                setFormData({ ...formData, grand_total: value })
              }}
              />
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
                ? "Update Sales"
                : "Create Sales"}
            </Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
