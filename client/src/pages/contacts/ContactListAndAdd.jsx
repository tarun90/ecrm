import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Input, Select, message, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Search from 'antd/es/transfer/search';
import moment from 'moment';
import axios from 'axios';

import { contactService } from '../../services/api';
import { getCompaniesNames } from '../Company/APIServices';
import './ContactListAndAdd.css';
import { Header } from 'antd/es/layout/layout';

const ContactListAndAdd = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [contacts, setContacts] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    const API_URL = import.meta.env.VITE_TM_API_URL;

    useEffect(() => {
        if (searchTerm) {
            const delayDebounceFn = setTimeout(() => {
                fetchContacts(searchTerm);
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            fetchContacts();
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const data = await getCompaniesNames();
            setCompanies(data);
        } catch (error) {
            message.error('Failed to fetch companies');
            console.error('Error fetching companies:', error);
        }
    };

    const fetchContacts = async (search = '') => {
        setIsSearching(true);
        try {
            const data = await contactService.getAllContacts(search);
            setContacts(data);
        } catch (error) {
            message.error('Failed to fetch contacts');
            console.error('Error fetching contacts:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (isEditing) {
                await contactService.updateContact(editingId, values);
                message.success('Contact updated successfully');
            } else {
                await contactService.createContact(values);
                message.success('Contact created successfully');
            }
            await fetchContacts();
            closeModal();
        } catch (error) {
            message.error(isEditing ? 'Failed to update contact' : 'Failed to create contact');
            console.error('Error handling contact:', error);
        }
    };

    const handleEdit = (contactToEdit) => {
        form.setFieldsValue({
            email: contactToEdit.email,
            firstName: contactToEdit.firstName,
            lastName: contactToEdit.lastName,
            jobTitle: contactToEdit.jobTitle,
            phoneNumber: contactToEdit.phoneNumber,
            lifecycleStage: contactToEdit.lifecycleStage,
            leadStatus: contactToEdit.leadStatus,
            contactOwner: contactToEdit.contactOwner,
            company: contactToEdit?.company
        });
        setEditingId(contactToEdit._id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleView = (contact) => {
        navigate(`/contact/view/${contact._id}`);
    };

    const handleDelete = async (id) => {
        try {
            await contactService.deleteContact(id);
            message.success('Contact deleted successfully');
            await fetchContacts();
        } catch (error) {
            message.error('Failed to delete contact');
            console.error('Error deleting contact:', error);
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            message.error('Please upload a CSV file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        setImportLoading(true);

        try {
            await axios.post(`${API_URL}/contacts/import`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchContacts();
            message.success('Contacts imported successfully');
            event.target.value = '';
        } catch (error) {
            message.error('Error importing contacts');
            console.error('Import error:', error);
        } finally {
            setImportLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            await contactService.exportContacts();
            message.success('Contacts exported successfully');
        } catch (error) {
            message.error('Failed to export contacts');
            console.error('Error exporting contacts:', error);
        }
    };

    const closeModal = () => {
        form.resetFields();
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingId(null);
    };

    return (
        <div className="contact-container">
            <Header className="contact-header">
                <div className="search-container">
                    <Search
                        allowClear
                        placeholder="Search by name, email, or phone..."
                        value={ searchTerm }
                        onChange={ (e) => setSearchTerm(e.target.value) }
                        className="search-input"
                        style={ { width: 200 } }
                    />
                    { isSearching && <span className="searching-indicator">Searching...</span> }
                </div>
                <div className="action-buttons">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={ handleImport }
                        style={ { display: 'none' } }
                        id="csv-upload"
                        disabled={ importLoading }
                    />
                    <label htmlFor="csv-upload" className="text-btn">
                        { importLoading ? 'Importing...' : 'Import CSV' }
                    </label>
                    <Button onClick={ handleExport } className='filter-btn'>Export CSV</Button>
                    <Button
                        type="primary"
                        icon={ <PlusOutlined /> }
                        onClick={ () => setIsModalOpen(true) }
                    >
                        Add Contact
                    </Button>
                </div>
            </Header>

            <div className="contact-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Owner</th>
                            <th>Primary Company</th>
                            <th>Lead Status</th>
                            <th>Create Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        { contacts.map(contact => (
                            <tr key={ contact?._id }>
                                <td>
                                    <a href="#" onClick={ () => handleView(contact) }>
                                        { contact?.firstName } { contact?.lastName }
                                    </a>
                                </td>
                                <td>{ contact?.email }</td>
                                <td>{ contact?.phoneNumber }</td>
                                <td>{ contact?.contactOwner?.name }</td>
                                <td>{ contact?.jobTitle }</td>
                                <td>{ contact?.leadStatus }</td>
                                <td>{ moment(contact?.createdAt).format('DD-MM-YYYY HH:mm') }</td>
                                <td>
                                    <Button type="link" className='edit-btn' onClick={ () => handleEdit(contact) }>
                                        Edit
                                    </Button>
                                    <Button
                                        type="link"
                                        className='delete-btn'
                                        danger
                                        onClick={ () => {
                                            Modal.confirm({
                                                title: 'Are you sure you want to delete this contact?',
                                                onOk: () => handleDelete(contact._id)
                                            });
                                        } }
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        )) }
                    </tbody>
                </table>
            </div>

            <Modal
                title={ isEditing ? 'Edit Contact' : 'Create Contact' }
                open={ isModalOpen }
                onCancel={ closeModal }
                footer={ null }
            >
                <Divider />
                <Form form={ form } layout="vertical" onFinish={ handleSubmit }>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={ [
                            { required: true, message: 'Please input email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ] }
                    >
                        <Input placeholder="Email" />
                    </Form.Item>

                    <Form.Item label="First Name" name="firstName">
                        <Input placeholder="First Name" />
                    </Form.Item>

                    <Form.Item label="Last Name" name="lastName">
                        <Input placeholder="Last Name" />
                    </Form.Item>

                    <Form.Item label="Job Title" name="jobTitle">
                        <Input placeholder="Job Title" />
                    </Form.Item>

                    <Form.Item label="Phone Number" name="phoneNumber">
                        <Input placeholder="Phone Number" />
                    </Form.Item>

                    <Form.Item label="Lifecycle Stage" name="lifecycleStage">
                        <Select>
                            <Select.Option value="Lead">Lead</Select.Option>
                            <Select.Option value="Customer">Customer</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Lead Status" name="leadStatus">
                        <Select>
                            <Select.Option value="">--</Select.Option>
                            <Select.Option value="Qualified">Qualified</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Company" name="company">
                        <Select placeholder="Select Company">
                            <Select.Option value="">Select Company</Select.Option>
                            { companies?.map((company) => (
                                <Select.Option key={ company._id } value={ company._id }>
                                    { company.companyName }
                                </Select.Option>
                            )) }
                        </Select>
                    </Form.Item>
                    <Divider />
                    <Form.Item className="flex justify-end gap-2">
                        <Button onClick={ closeModal } className='text-btn '>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            { isEditing ? 'Update Contact' : 'Create Contact' }
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
};

export default ContactListAndAdd;