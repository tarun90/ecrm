import React, { useState, useEffect } from "react";
import axios from "axios";
import { Package, Edit2, Search, Plus, Trash2 } from "lucide-react";
import MainLayout from "../../components/MainLayout";
import "../../components/custome.css";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

function Products() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchProducts();
  }, []);

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
      setSelectedProducts([]); // Clear selection after deletion
    } catch (error) {
      setError("Failed to delete selected products. Please try again.");
      console.error("Error deleting multiple products:", error);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && currentProduct) {
        await axios.put(
          `${import.meta.env.VITE_TM_API_URL}/api/products/${currentProduct._id
          }`,
          formData
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_TM_API_URL}/api/products`,
          formData
        );
      }
      setIsModalOpen(false);
      setFormData(initialFormData);
      fetchProducts();
    } catch (error) {
      setError("Failed to save product. Please try again.");
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setFormData(product);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return (
    <div className="products-section">
      {/* Search and Add Product Bar */ }
      <div className="product-header">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={ searchTerm }
            onChange={ (e) => setSearchTerm(e.target.value) }
            className="product-search"
          />
        </div>
        <div className="btn-wrapper">
          <Button
            icon={ <PlusOutlined /> }
            onClick={ () => {
              setIsEditing(false);
              setFormData(initialFormData);
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

      {/* Error Message */ }
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

      {/* Products Grid */ }
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
                  >

                  </Button>
                  <Button
                    type="text"
                    danger
                    icon={ <DeleteOutlined /> }
                    onClick={ () => deleteProduct(product._id) }
                    className="delete-btn"
                  >
                  </Button>
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

      {/* Modal */ }
      { isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                { isEditing ? "Edit Product" : "Add New Product" }
              </h2>
              <button onClick={ () => setIsModalOpen(false) }>
                <svg
                  className="close-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={ 2 }
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={ handleSubmit } className="form-container">
              <div className="modal-content scroll">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={ formData.name }
                  onChange={ (e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-field"
                />
                <textarea
                  placeholder="Short Description"
                  value={ formData.description_short }
                  onChange={ (e) =>
                    setFormData({
                      ...formData,
                      description_short: e.target.value,
                    })
                  }
                  className="input-field"
                  rows="2"
                />
                <textarea
                  placeholder="Long Description"
                  value={ formData.description_long }
                  onChange={ (e) =>
                    setFormData({
                      ...formData,
                      description_long: e.target.value,
                    })
                  }
                  className="input-field"
                  rows="3"
                />
                <select
                  value={ formData.product_type }
                  onChange={ (e) =>
                    setFormData({ ...formData, product_type: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Select Product Type</option>
                  <option value="physical">Physical</option>
                  <option value="digital">Digital</option>
                  <option value="subscription">Subscription</option>
                  <option value="service">Service</option>
                </select>
                <input
                  type="text"
                  placeholder="SKU"
                  value={ formData.sku }
                  onChange={ (e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Billing Frequency (e.g., monthly, annually)"
                  value={ formData.billing_frequency }
                  onChange={ (e) =>
                    setFormData({
                      ...formData,
                      billing_frequency: e.target.value,
                    })
                  }
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Term (e.g., 12 months)"
                  value={ formData.term }
                  onChange={ (e) =>
                    setFormData({ ...formData, term: e.target.value })
                  }
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Unit Cost"
                  value={ formData.unit_cost || "" } // Ensures value updates dynamically
                  onChange={ (e) =>
                    setFormData({ ...formData, unit_cost: e.target.value })
                  }
                  className="input-field"
                />
                <select
                  value={ formData.currency }
                  onChange={ (e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
                <select
                  value={
                    formData.tax_rate !== null &&
                      formData.tax_rate !== undefined
                      ? formData.tax_rate
                      : ""
                  } // Ensure correct value
                  onChange={ (e) =>
                    setFormData({
                      ...formData,
                      tax_rate:
                        e.target.value !== "" ? Number(e.target.value) : null, // Convert to number, reset to null if empty
                    })
                  }
                  className="input-field"
                >
                  <option value="">Select Tax Rate (%)</option>
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                  <option value="15">15%</option>
                  <option value="18">18%</option>
                  <option value="20">20%</option>
                  <option value="25">25%</option>
                </select>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={ () => setIsModalOpen(false) }
                  className="text-btn"
                >
                  Cancel
                </button>
                <button type="submit" disabled={ loading } className="submit-btn">
                  { loading
                    ? "Saving..."
                    : isEditing
                      ? "Update Product"
                      : "Create Product" }
                </button>
              </div>
            </form>
          </div>
        </div>
      ) }
    </div>
  );
}

export default Products;
