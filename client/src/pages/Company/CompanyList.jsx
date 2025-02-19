import React, { useEffect, useState } from 'react';
import './company.css';
import moment from 'moment';
import axios from 'axios';
import { getCompanies, deleteCompany } from './APIServices';
import { useNavigate } from 'react-router-dom';
import { message, Popconfirm, Button, Divider, Modal, Form, Input, Select, Col, Row } from 'antd';
import CompanyFormModal from './CompanyFormModal';
// import { Button, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Header } from 'antd/es/layout/layout';
import { Delete, Edit } from 'lucide-react';
const CompanyList = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { Search } = Input;
    const [contacts, setContacts] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [contact, setContact] = useState({
        email: '',
        firstName: '',
        lastName: '',
        jobTitle: '',
        phoneNumber: '',
        lifecycleStage: 'Lead',
        leadStatus: '',
        contactOwner: ''
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setsearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importMessage, setImportMessage] = useState('');
    const [importStatus, setImportStatus] = useState('');
    const API_URL = import.meta.env.VITE_TM_API_URL;

    useEffect(() => {
        if (searchTerm) {
            const delayDebounceFn = setTimeout(() => {
                fetchCompanies(searchTerm);
            }, 500);

            return () => clearTimeout(delayDebounceFn);
        } else {
            fetchCompanies();
        }
    }, [searchTerm]);

    const handleAddCompany = () => {
        setEditId(null);
        setModalVisible(true);
    };

    const handleEditCompany = (id) => {
        setEditId(id);
        setModalVisible(true);
    };

    const fetchCompanies = async (searchTerm = "") => {
        const data = await getCompanies(searchTerm);
        setCompanies(data);

    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContact({
            ...contact,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await contactService.updateContact(editingId, contact);
        } else {
            await contactService.createContact(contact);
        }
        closeModal();

    };

    const handleDelete = async (id) => {
        const deleteResponse = await deleteCompany(id);
        if (deleteResponse?.status != 200) {
            message.error(deleteResponse?.message)
        } else {
            message.success("Company deleted successfully")
        }
        fetchCompanies()
    };

    // Update your handleImport function:
    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check if it's a CSV file
        if (!file.name.endsWith('.csv')) {
            alert('Please upload a CSV file');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`${API_URL}/contacts/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data) {
                alert('Contacts imported successfully!');
            }

            // Clear the file input
            event.target.value = '';

        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing contacts. Please try again.');
        }
    };

    const handleExport = async () => {
        try {
            await contactService.exportContacts();
        } catch (error) {
            console.error('Error exporting contacts:', error);
        }
    };
    const handleView = (id) => {
        navigate(`/company/view/${id}`);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingId(null);
        setContact({
            email: '',
            firstName: '',
            lastName: '',
            jobTitle: '',
            phoneNumber: '',
            lifecycleStage: 'Lead',
            leadStatus: '',
            contactOwner: ''
        });
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditingId(null);
        navigate('/company/add')
        // setIsModalOpen(true);
    };

    return (
        <div className="contact-container">
            <Header className="contact-header">
                <div className="search-container">
                    <h1>Companies</h1>

                    <Search
                        allowClear
                        placeholder="Search by name, email, or phone..."
                        value={ searchTerm }
                        onChange={ (e) => setsearchTerm(e.target.value) }
                        className="search-input"
                        style={ { width: 300 } }
                    />

                    {/* { isSearching && <span className="searching-indicator">Searching...</span> } */ }
                </div>
                <div className="action-buttons">
                    {/* <input
                            type="file"
                            accept=".csv"
                            onChange={ handleImport }
                            style={ { display: 'none' } }
                            id="csv-upload"
                        />
                        <label htmlFor="csv-upload" className="text-btn">
                            Import CSV
                        </label>
                        <button className="export-btn" onClick={ handleExport }>
                            Export CSV
                        </button> */}
                    <button className="add-contact-btn" onClick={ handleAddCompany }>
                        <PlusOutlined />
                        Add Company
                    </button>
                </div>
            </Header>
            <div className="contact-table">
                <table>
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>Company Owner</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>City</th>
                            <th>Country</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        { companies.map(company => (
                            <tr key={ company?._id }>
                                <td onClick={ () => handleView(company._id) }> <a href='#'> { company?.companyName || '-' } </a> </td>
                                <td>{ company?.companyOwner || '-' }</td>
                                <td>{ company?.phoneNumber || '-' }</td>
                                <td>{ company?.email || '-' }</td>
                                <td>{ company?.city || '-' }</td>
                                <td>{ company?.country || '-' }</td>
                                <td>
                                    <div className='action-buttons'>
                                        <Button className="edit-btn" onClick={ () => handleEditCompany(company._id) }>
                                            <EditOutlined />
                                        </Button>
                                        <Popconfirm
                                            title="Delete Company"
                                            description="Are you sure you want to delete this company?"
                                            onConfirm={ (e) => {
                                                e.stopPropagation();
                                                handleDelete(company._id);
                                            } }
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button className="delete-btn" onClick={ (e) => e.stopPropagation() }>
                                                <DeleteOutlined />
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                </td>
                            </tr>
                        )) }
                    </tbody>
                </table>
            </div>
            <Modal
                title={ isEditing ? "Edit Company" : "Create Company" }
                open={ isModalOpen }
                onCancel={ closeModal }
                footer={ null }
            >
                <Form
                    form={ form }
                    layout="vertical"
                    initialValues={ contact }
                    onFinish={ handleSubmit }
                >
                    <Row gutter={ 24 }>
                        {/* Column 1 */ }
                        <Col span={ 12 }>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={ [
                                    { required: true, message: "Please input email!" },
                                    { type: "email", message: "Please enter a valid email!" }
                                ] }
                            >
                                <Input placeholder="Email" onChange={ handleChange } />
                            </Form.Item>

                            <Form.Item label="First Name" name="firstName">
                                <Input placeholder="First Name" onChange={ handleChange } />
                            </Form.Item>

                            <Form.Item label="Last Name" name="lastName">
                                <Input placeholder="Last Name" onChange={ handleChange } />
                            </Form.Item>

                            <Form.Item label="Phone Number" name="phoneNumber">
                                <Input placeholder="Phone Number" onChange={ handleChange } />
                            </Form.Item>
                        </Col>

                        {/* Column 2 */ }
                        <Col span={ 12 }>
                            <Form.Item label="Job Title" name="jobTitle">
                                <Input placeholder="Job Title" onChange={ handleChange } />
                            </Form.Item>

                            <Form.Item label="Lifecycle Stage" name="lifecycleStage">
                                <Select onChange={ (value) => handleChange({ target: { name: "lifecycleStage", value } }) }>
                                    <Select.Option value="Lead">Lead</Select.Option>
                                    <Select.Option value="Customer">Customer</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item label="Lead Status" name="leadStatus">
                                <Select onChange={ (value) => handleChange({ target: { name: "leadStatus", value } }) }>
                                    <Select.Option value="--">--</Select.Option>
                                    <Select.Option value="Qualified">Qualified</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item className="modal-footer">
                        <Button onClick={ closeModal } className="text-btn">
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            { isEditing ? "Update Contact" : "Create Contact" }
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>


            <CompanyFormModal
                visible={ modalVisible }
                onCancel={ () => setModalVisible(false) }
                editId={ editId }
                fetchCompanies={ fetchCompanies }
            />
        </div>
    );
};

export default CompanyList;