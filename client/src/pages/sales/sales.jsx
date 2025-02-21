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
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_TM_API_URL}/api/sales`);
      setSales(response.data);
    } catch (error) {
      message.error("Failed to fetch sales.");
    } finally {
      setLoading(false);
    }
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

  const handleClearFilters = () => {
    setFilters({
      so_number: "",
      companyName: "",
      sales_date: null,
      status: "",
    });
  };

  const disableFutureDates = (current) => {
    return current && current > dayjs().endOf("day"); // Prevents selection beyond today
  };

  const filteredSales = sales.filter((sale) => {
    const {
      so_number,
      companyName,
      status,
      sales_date_range = [],
      updated_date_range = [],
    } = filters;
  
    const matchesSO =
      !so_number ||
      (sale.sales_number &&
        sale.sales_number.toLowerCase().includes(so_number.toLowerCase()));
  
    const matchesCompany =
      !companyName ||
      (sale.company?.companyName &&
        sale.company.companyName.toLowerCase().includes(companyName.toLowerCase()));
  
    const matchesStatus = !status || sale.status === status;
  
    const matchesSalesCreatedDate =
      !Array.isArray(sales_date_range) ||
      sales_date_range.length !== 2 ||
      (sale.sales_date &&
        dayjs(sale.sales_date).isBetween(
          dayjs(sales_date_range[0]),
          dayjs(sales_date_range[1]),
          "day",
          "[]"
        ));
  
    const matchesSalesUpdatedDate =
      !Array.isArray(updated_date_range) ||
      updated_date_range.length !== 2 ||
      (sale.sales_updated_date &&
        dayjs(sale.sales_updated_date).isBetween(
          dayjs(updated_date_range[0]),
          dayjs(updated_date_range[1]),
          "day",
          "[]"
        ));
  
    return matchesSO && matchesCompany && matchesStatus && matchesSalesCreatedDate && matchesSalesUpdatedDate;
  });
  

  const columns = [
    {
        title: "SO Number",
        dataIndex: "sales_number",
        key: "sales_number",
        sorter: (a, b) => a.sales_number.localeCompare(b.sales_number),
        render: (_, record) => (
          <a
            onClick={() => navigate(`/sales/view/${record._id}`)} // ✅ Works now
            style={{ cursor: 'pointer', color: '#1890ff' }}
          >
            {record.sales_number}
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
        <>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record._id)} />
        </>
      ),
    },
  ];
  

  return (
    <Layout className="sales-layout">
      <Header className="sales-header">
        <h1>Sales Management</h1>
        <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
          New Sale
        </Button>
      </Header>

      <div className="filters" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Input
          placeholder="SO Number..."
          value={filters.so_number}
          onChange={(e) => setFilters({ ...filters, so_number: e.target.value })}
          prefix={<SearchOutlined />}
          style={{ width: 180 }}
        />

        <Input
          placeholder="Company Name..."
          value={filters.companyName}
          onChange={(e) => setFilters({ ...filters, companyName: e.target.value })}
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
        />

        <RangePicker
        placeholder={["Sales Created From", "Sales Created To"]}
        value={filters.sales_date_range}
        onChange={(dates) => setFilters({ ...filters, sales_date_range: dates })}
        format="DD-MM-YYYY"
        disabledDate={disableFutureDates}
        />

        <RangePicker
        placeholder={["Updated From", "Updated To"]}
        value={filters.updated_date_range}
        onChange={(dates) => setFilters({ ...filters, updated_date_range: dates })}
        format="DD-MM-YYYY"
        disabledDate={disableFutureDates}
        />

        <Select
          placeholder="Status"
          value={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value })}
          allowClear
          style={{ width: 150 }}
        >
            <Option value="Pending">Pending</Option>
            <Option value="In Progress">In Progress</Option>
            <Option value="Completed">Completed</Option>
            <Option value="On Hold">On Hold</Option>
            <Option value="Canceled">Canceled</Option>
        </Select>

        <Button onClick={handleClearFilters} danger>
          Clear Filters
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSales}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={isEditing ? "Edit Sale" : "Create New Sale"}
        width={400}
        onClose={() => setIsDrawerOpen(false)}
        visible={isDrawerOpen}
        footer={
          <div style={{ textAlign: "right" }}>
            <Button onClick={() => setIsDrawerOpen(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              {isEditing ? "Update Sale" : "Save Sale"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item label="Technology" name="technology" rules={[{ required: true, message: "Please select a technology!" }]}>
                <Select placeholder="Select Technology">
                    {Technologies.map((tech) => (
                    <Option key={tech} value={tech}>
                        {tech}
                    </Option>
                    ))}
                </Select>
            </Form.Item>


          <Form.Item label="Company" name="company" rules={[{ required: true }]}>
            <Select placeholder="Select Company">
              {companies.map((company) => (
                <Option key={company._id} value={company._id}>
                  {company.companyName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Grand Total" name="grand_total" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item label="Activities" name="activities">
            <Select placeholder="Select Activity">
              {activities.map((activity) => (
                <Option key={activity._id} value={activity.name}>
                  {activity.name}
                </Option>
              ))}
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
