import React, { useEffect, useState } from 'react';
import { message, Popconfirm, Button, Input, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getCategories, createCategory, updateCategory, deleteCategory } from './categoryService';
import './categories.css';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editId, setEditId] = useState(null);
    const [categoryName, setCategoryName] = useState('');

    useEffect(() => {
        fetchCategories();
    }, [searchTerm]);

    const fetchCategories = async () => {
        try {
            const data = await getCategories(searchTerm);
            setCategories(data);
        } catch (error) {
            message.error('Failed to fetch categories');
        }
    };

    const handleAddCategory = () => {
        setEditId(null);
        setCategoryName('');
        setModalVisible(true);
    };

    const handleEditCategory = (category) => {
        setEditId(category._id);
        setCategoryName(category.categoryName);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const response = await deleteCategory(id);
            if (response?.status === 200) {
                message.success("Category deleted successfully");
                fetchCategories();
            } else {
                message.error(response?.message || 'Failed to delete category');
            }
        } catch (error) {
            message.error('Error deleting category');
        }
    };

    const handleSubmit = async () => {
        if (!categoryName.trim()) {
            message.error('Category name cannot be empty');
            return;
        }

        const categoryData = {
            categoryName: categoryName.trim()
        };
        
        try {
            if (editId) {
                await updateCategory(editId, categoryData);
                message.success('Category updated successfully');
            } else {
                await createCategory(categoryData);
                message.success('Category created successfully');
            }
            setModalVisible(false);
            fetchCategories();
        } catch (error) {
            message.error(editId ? 'Failed to update category' : 'Failed to create category');
        }
    };

    return (
        <div className="category-container">
            <div className="category-header">
                <div className="search-container">
                    <Input
                        type="text"
                        placeholder="Search Category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="action-buttons">
                    <Button 
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddCategory}
                        className="add-category-btn"
                    >
                        Add Category
                    </Button>
                </div>
            </div>

            <div className="category-table">
                <table>
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(category => (
                            <tr key={category._id}>
                                <td>{category.categoryName}</td>
                                <td>
                                    <Button 
                                        type="primary"
                                        onClick={() => handleEditCategory(category)}
                                        className="edit-btn"
                                    >
                                        Edit
                                    </Button>
                                    <Popconfirm
                                        title="Delete Category"
                                        description="Are you sure you want to delete this category?"
                                        onConfirm={() => handleDelete(category._id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button danger className="delete-btn">
                                            Delete
                                        </Button>
                                    </Popconfirm>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                title={editId ? "Edit Category" : "Add Category"}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                width={400}
            >
                <div className="category-form">
                    <Input
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Enter Category Name"
                        className="form-input"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default CategoryList;