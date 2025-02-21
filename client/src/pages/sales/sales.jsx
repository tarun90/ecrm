import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import isBetween from "dayjs/plugin/isBetween";
import {
  Layout,
  Button,
  Input,
  Select,
  DatePicker,
  Table,
  Drawer,
  Form,
  InputNumber,
  message,
  Pagination,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
dayjs.extend(isBetween);
const { Header } = Layout;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Technologies = [
  'React',
  'Angular',
  'Vue.js',
  'Node.js',
  'Python',
  'Java',
  'PHP',
  'WordPress',
  'Magento',
  'Shopify',
  'Other'
];

const Sales = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);


  // Filter states
  const [filters, setFilters] = useState({
    so_number: "",
    companyName: "",
    sales_date: null,
    sales_date_range: [],
    updated_date_range: [],
    status: "",
  });

  useEffect(() => {
    fetchSales();
    fetchCompanies();
    fetchActivities();
  }, [filters]);

  const fetchSales = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_TM_API_URL}/api/sales`, {
        params: { 
          page, 
          pageSize: size, 
          search: filters.search || "", 
          status: filters.status || "", 
          sales_date_range: filters.sales_date_range.length === 2 
            ? [dayjs(filters.sales_date_range[0]).startOf('day').toISOString(), dayjs(filters.sales_date_range[1]).endOf('day').toISOString()]
            : null, 
          updated_date_range: filters.updated_date_range.length === 2 
            ? [dayjs(filters.updated_date_range[0]).startOf('day').toISOString(), dayjs(filters.updated_date_range[1]).endOf('day').toISOString()]
            : null, 
        }
      });
  
      if (response.data.success) {
        setSales(response.data.data);
        setTotal(response.data.total);
        setCurrentPage(page);
        setPageSize(size);
      } else {
        message.error(response.data.message || "Failed to fetch sales data.");
      }
    } catch (error) {
      message.error("Failed to fetch sales.");
    } finally {
      setLoading(false);
    }
  };  

  const handlePageChange = (page, size) => {
    fetchSales(page, size, filters.search);
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_TM_API_URL}/api/company`);
      setCompanies(response.data);
    } catch (error) {
      message.error("Failed to fetch companies.");
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_TM_API_URL}/api/activities`);
      setActivities(response.data);
    } catch (error) {
      message.error("Failed to fetch activities.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_TM_API_URL}/api/sales/${id}`);
      message.success("Sale deleted successfully.");
      fetchSales();
    } catch (error) {
      message.error("Failed to delete sale.");
    }
  };

  const handleEdit = (sale) => {
    setIsEditing(true);
    setCurrentSale(sale);
    form.setFieldsValue({
      ...sale,
      company: sale.company?._id,
      sales_date: sale.sales_date ? dayjs(sale.sales_date) : null,
    });
    setIsDrawerOpen(true);
  };

  const handleAdd = () => {
    setIsEditing(false);
    form.resetFields();
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditing && currentSale) {
        await axios.put(`${import.meta.env.VITE_TM_API_URL}/api/sales/${currentSale._id}`, values);
        message.success("Sale updated successfully.");
      } else {
        await axios.post(`${import.meta.env.VITE_TM_API_URL}/api/sales`, values);
        message.success("Sale created successfully.");
      }
      setIsDrawerOpen(false);
      fetchSales();
    } catch (error) {
      message.error("Failed to save sale.");
    }
  };

  const handleSearch = (e) => {
    setFilters(prevFilters => ({ ...prevFilters, search: e.target.value }));
  };
  
  const handleDateFilterChange = (dates, type) => {
    setFilters(prevFilters => ({ 
      ...prevFilters, 
      [type]: dates && dates.length ? dates : []
    }));
  }; 
  
  const handleStatusChange = (value) => {
    setFilters(prevFilters => ({ ...prevFilters, status: value }));
  };
  
  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "",
      sales_date_range: [],
      updated_date_range: []
    });
  };

  const columns = [
    {
      title: "SO Number",
      dataIndex: "sales_number",
      key: "sales_number",
      sorter: (a, b) => a.sales_number.localeCompare(b.sales_number),
      render: (_, record) => (
        <a
          onClick={ () => navigate(`/sales/view/${record._id}`) } // ✅ Works now
          style={ { cursor: 'pointer', color: '#1890ff' } }
        >
          { record.sales_number }
        </a>
      ),
    },
    {
      title: "Company Name",
      dataIndex: ["company", "companyName"],
      key: "companyName",
      sorter: (a, b) => (a.company?.companyName || "").localeCompare(b.company?.companyName || ""),
    },
    {
      title: "Technology",
      dataIndex: "technology",
      key: "technology",
      sorter: (a, b) => a.technology.localeCompare(b.technology),
    },
    {
      title: "Sales Date",
      dataIndex: "sales_date",
      key: "sales_date",
      render: (date) => (date ? dayjs(date).format("DD-MM-YYYY hh:mm A") : "N/A"),
      sorter: (a, b) => new Date(a.sales_date) - new Date(b.sales_date),
    },
    {
      title: "Sales Date",
      dataIndex: "sales_updated_date",
      key: "sales_updated_date",
      render: (date) => (date ? dayjs(date).format("DD-MM-YYYY hh:mm A") : "N/A"),
      sorter: (a, b) => new Date(a.sales_updated_date) - new Date(b.sales_updated_date),
    },
    {
      title: "Grand Total",
      dataIndex: "grand_total",
      key: "grand_total",
      render: (total, record) => {
        const currency = record.company?.currency || "USD";
        return `${currency} ${total.toFixed(2)}`;
      },
      sorter: (a, b) => a.grand_total - b.grand_total,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="action-buttons">
          <Button icon={ <EditOutlined /> } onClick={ () => handleEdit(record) } className="edit-btn" />
          <Button icon={ <DeleteOutlined /> } danger onClick={ () => handleDelete(record._id) } className="delete-btn " />
        </div>
      ),
    },
  ];


  return (
    <Layout className="sales-layout">
      <Header className="sales-header">
        <div className="heading">
          <h1>Sales Management</h1>
        </div>
        <Button icon={ <PlusOutlined /> } type="primary" onClick={ handleAdd }>
          New Sale
        </Button>
      </Header>

      <div className="global-search">

      <Search
        allowClear
        placeholder="Search by SO Number or Company Name"
        onChange={handleSearch}
        className="search-input"
        style={{ width: 250 }}
      />
        <div className="fillter-wrapper">
        <RangePicker
          placeholder={["Sales Created From", "Sales Created To"]}
          value={filters.sales_date_range}
          onChange={(dates) => handleDateFilterChange(dates, "sales_date_range")}
          format="DD-MM-YYYY"
          disabledDate={(current) => current && current > dayjs().endOf("day")}
        />

        <RangePicker
          placeholder={["Updated From", "Updated To"]}
          value={filters.updated_date_range}
          onChange={(dates) => handleDateFilterChange(dates, "updated_date_range")}
          format="DD-MM-YYYY"
          disabledDate={(current) => current && current > dayjs().endOf("day")}
        />

        <Select
          placeholder="Status"
          value={filters.status}
          onChange={handleStatusChange}
          allowClear
          style={{ width: 150 }}
        >
          <Option value="Pending">Pending</Option>
          <Option value="In Progress">In Progress</Option>
          <Option value="Completed">Completed</Option>
          <Option value="On Hold">On Hold</Option>
          <Option value="Canceled">Canceled</Option>
        </Select>

          <Button onClick={ handleClearFilters } className="delete-btn">
            Clear Filters
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={sales}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />
      <div className="pagination">
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={(page, size) => fetchSales(page, size)}
        showQuickJumper
        showSizeChanger
        pageSizeOptions={["10", "20", "50", "100"]}
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
      />
    </div>
      <Drawer
        title={ isEditing ? "Edit Sale" : "Create New Sale" }
        width={ 400 }
        onClose={ () => setIsDrawerOpen(false) }
        visible={ isDrawerOpen }
        footer={
          <div style={ { textAlign: "right" } }>
            <Button onClick={ () => setIsDrawerOpen(false) } style={ { marginRight: 8 } }>
              Cancel
            </Button>
            <Button type="primary" onClick={ () => form.submit() }>
              { isEditing ? "Update Sale" : "Save Sale" }
            </Button>
          </div>
        }
      >
        <Form form={ form } layout="vertical" onFinish={ handleSubmit }>
          <Form.Item label="Technology" name="technology" rules={ [{ required: true, message: "Please select a technology!" }] }>
            <Select placeholder="Select Technology">
              { Technologies.map((tech) => (
                <Option key={ tech } value={ tech }>
                  { tech }
                </Option>
              )) }
            </Select>
          </Form.Item>


          <Form.Item label="Company" name="company" rules={ [{ required: true }] }>
            <Select placeholder="Select Company">
              { companies.map((company) => (
                <Option key={ company._id } value={ company._id }>
                  { company.companyName }
                </Option>
              )) }
            </Select>
          </Form.Item>

          <Form.Item label="Grand Total" name="grand_total" rules={ [{ required: true }] }>
            <InputNumber style={ { width: "100%" } } min={ 0 } />
          </Form.Item>

          <Form.Item label="Activities" name="activities">
            <Select placeholder="Select Activity">
              { activities.map((activity) => (
                <Option key={ activity._id } value={ activity.name }>
                  { activity.name }
                </Option>
              )) }
            </Select>
          </Form.Item>

          <Form.Item label="Status" name="status">
            <Select placeholder="Select Status">
              <Option value="Pending">Pending</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="Completed">Completed</Option>
              <Option value="On Hold">On Hold</Option>
              <Option value="Canceled">Canceled</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </Layout>
  );
};

export default Sales;
