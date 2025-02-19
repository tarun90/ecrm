import React, { useState, useEffect } from "react";
import axios from "axios";
import { Package, Edit2, Search, Plus, Trash2 } from "lucide-react";
import MainLayout from "../../components/MainLayout";
import "../../components/custome.css";
import "./Products.css";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Select, Button, Divider, Row, Col } from "antd";
import TextArea from "antd/es/input/TextArea";

function Products() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const { Search } = Input;
  const initialFormData = {
    name: "",
    product_type: "",
    sku: "",
    unit_cost: 0,
    description_short: "",
    billing_frequency: "",
    currency: "USD",
    tax_rate: 0,
    description_long: "",
    term: "",
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Set form values when editing
  useEffect(() => {
    if (currentProduct && isEditing) {
      form.setFieldsValue(currentProduct);
    }
  }, [currentProduct, isEditing, form]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_TM_API_URL}/api/products`
      );
      setProducts(response.data);
    } catch (error) {
      setError("Failed to fetch products. Please try again later.");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_TM_API_URL}/api/products/${productId}`
      );
      setProducts(products.filter((product) => product._id !== productId));
    } catch (error) {
      setError("Failed to delete product. Please try again.");
      console.error("Error deleting product:", error);
    }
  };

  const deleteMultipleProducts = async () => {
    if (selectedProducts.length === 0) {
      setError("Please select at least one product to delete.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_TM_API_URL}/api/products/delete-multiple`,
        { productIds: selectedProducts }
      );
      setProducts(
        products.filter((product) => !selectedProducts.includes(product._id))
      );
      setSelectedProducts([]);
    } catch (error) {
      setError("Failed to delete selected products. Please try again.");
      console.error("Error deleting multiple products:", error);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    try {
      if (isEditing && currentProduct) {
        await axios.put(
          `${import.meta.env.VITE_TM_API_URL}/api/products/${currentProduct._id}`,
          values
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_TM_API_URL}/api/products`,
          values
        );
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchProducts();
      setCurrentProduct(null);
      setIsEditing(false);
    } catch (error) {
      setError("Failed to save product. Please try again.");
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const onClose = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentProduct(null);
    form.resetFields();
  };

  const filteredProducts = products?.filter(
    (product) =>
      product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="products-section">
      <div className="product-header">
        <div className="product-wrapper">
          <h1>Products</h1>
          <div className="search-container">

            <Search
              allowClear
              placeholder="Search by name, email, or phone..."
              value={ searchTerm }
              onChange={ (e) => setSearchTerm(e.target.value) }
              className="search-input"
              style={ { width: 200 } }
            />
          </div>
        </div>
        <div className="btn-wrapper">
          <Button
            icon={ <PlusOutlined /> }
            onClick={ () => {
              setIsEditing(false);
              setCurrentProduct(null);
              form.resetFields();
              setIsModalOpen(true);
            } }
            className="ant-btn-primary"
          >
            Add Product
          </Button>
          <Button
            type="text"
            icon={ <DeleteOutlined /> }
            onClick={ deleteMultipleProducts }
            disabled={ selectedProducts.length === 0 }
            className="delete-btn"
          >
            Delete Selected
          </Button>
        </div>
      </div>

      { error && (
        <div className="error-message">
          <div className="error-content">
            <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="error-text">{ error }</p>
          </div>
        </div>
      ) }

      { loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="products-grid">
          { filteredProducts.map((product) => (
            <div key={ product._id } className="product-card">
              <input
                type="checkbox"
                checked={ selectedProducts.includes(product._id) }
                onChange={ () => {
                  setSelectedProducts((prev) =>
                    prev.includes(product._id)
                      ? prev.filter((id) => id !== product._id)
                      : [...prev, product._id]
                  );
                } }
              />
              <div className="product-info">
                <div>
                  <h3 className="product-name">{ product.name }</h3>
                  <p className="product-sku">SKU: { product.sku }</p>
                </div>
                <div>
                  <Button
                    type="text"
                    icon={ <EditOutlined /> }
                    onClick={ () => handleEdit(product) }
                    className="edit-button"
                  />
                  <Button
                    type="text"
                    danger
                    icon={ <DeleteOutlined /> }
                    onClick={ () => deleteProduct(product._id) }
                    className="delete-btn"
                  />
                </div>
              </div>
              <div className="product-details">
                <p className="short-description">{ product.description_short }</p>
                <div className="price-container">
                  <span className="price">
                    { product.currency } { product.unit_cost }
                  </span>
                  <span className="product-type">{ product.product_type }</span>
                </div>
              </div>
            </div>
          )) }
        </div>
      ) }

      <Modal
        title={ isEditing ? "Edit Product" : "Add New Product" }
        open={ isModalOpen }
        onCancel={ onClose }
        footer={ null }
        width={ 600 }
      >
        <Divider />
        <Form form={ form } layout="vertical" onFinish={ handleSubmit }>
          <Row gutter={ 16 }>
            <Col span={ 12 }>
              <Form.Item
                label="Product Name"
                name="name"
                rules={ [{ required: true, message: 'Please input product name!' }] }
              >
                <Input placeholder="Product Name" />
              </Form.Item>

              <Form.Item label="Short Description" name="description_short">
                <TextArea placeholder="Short Description" rows={ 2 } />
              </Form.Item>

              <Form.Item label="SKU" name="sku">
                <Input placeholder="SKU" />
              </Form.Item>

              <Form.Item label="Unit Cost" name="unit_cost">
                <Input type="number" placeholder="Unit Cost" />
              </Form.Item>
              <Form.Item label="Currency" name="currency">
                <Select placeholder="Select Currency">
                  <Select.Option value="USD">USD</Select.Option>
                  <Select.Option value="EUR">EUR</Select.Option>
                  <Select.Option value="GBP">GBP</Select.Option>
                  <Select.Option value="JPY">JPY</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={ 12 }>
              <Form.Item label="Product Type" name="product_type">
                <Select placeholder="Select Product Type">
                  <Select.Option value="physical">Physical</Select.Option>
                  <Select.Option value="digital">Digital</Select.Option>
                  <Select.Option value="subscription">Subscription</Select.Option>
                  <Select.Option value="service">Service</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Long Description" name="description_long">
                <TextArea placeholder="Long Description" rows={ 2 } />
              </Form.Item>



              <Form.Item label="Billing Frequency" name="billing_frequency">
                <Input placeholder="Billing Frequency (e.g., monthly, annually)" />
              </Form.Item>

              <Form.Item label="Term" name="term">
                <Input placeholder="Term (e.g., 12 months)" />
              </Form.Item>



              <Form.Item label="Tax Rate (%)" name="tax_rate">
                <Select placeholder="Select Tax Rate (%)">
                  <Select.Option value={ 0 }>0%</Select.Option>
                  <Select.Option value={ 5 }>5%</Select.Option>
                  <Select.Option value={ 10 }>10%</Select.Option>
                  <Select.Option value={ 15 }>15%</Select.Option>
                  <Select.Option value={ 18 }>18%</Select.Option>
                  <Select.Option value={ 20 }>20%</Select.Option>
                  <Select.Option value={ 25 }>25%</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Form.Item className="modal-footer">
            <Button onClick={ onClose } className="text-btn">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={ loading }>
              { isEditing ? "Update Product" : "Create Product" }
            </Button>
          </Form.Item>
        </Form>
      </Modal>


    </div>
  );
}

export default Products;