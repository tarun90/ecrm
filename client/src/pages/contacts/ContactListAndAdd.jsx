import React, { useEffect, useState } from 'react';
import { contactService } from '../../services/api';
import './ContactListAndAdd.css';
import moment from 'moment';
import axios from 'axios';
import MainLayout from '../../components/MainLayout';
import { getCompaniesNames } from '../Company/APIServices';
import Search from 'antd/es/transfer/search';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const ContactListAndAdd = () => {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [contact, setContact] = useState({
        email: '',
        firstName: '',
        lastName: '',
        jobTitle: '',
        phoneNumber: '',
        lifecycleStage: 'Lead',
        leadStatus: '',
        contactOwner: '',
        company: '',
    });
    const [companies, setCompanies] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importMessage, setImportMessage] = useState('');
    const [importStatus, setImportStatus] = useState('');
    const API_URL = import.meta.env.VITE_TM_API_URL;

    useEffect(() => {
        if (searchTerm) {
            const delayDebounceFn = setTimeout(() => {
                fetchContacts(searchTerm);
            }, 300);
            const handleImport = async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                // Check if it's a CSV file
                if (!file.name.endsWith('.csv')) {
                    setImportMessage('Please upload a CSV file');
                    return;
                }

                const formData = new FormData();
                formData.append('file', file);

                setImportLoading(true);
                setImportMessage('Importing contacts...');

                try {
                    await axios.post(`${API_URL}/contacts/import`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    await fetchContacts();
                    setImportMessage('Contacts imported successfully!');
                    event.target.value = ''; // Reset file input
                } catch (error) {
                    console.error('Import error:', error);
                    setImportMessage('Error importing contacts. Please try again.');
                } finally {
                    setImportLoading(false);
                    // Clear success message after 3 seconds
                    setTimeout(() => setImportMessage(''), 3000);
                }
            };



            return () => clearTimeout(delayDebounceFn);
        } else {
            fetchContacts();
        }
    }, [searchTerm]);
    useEffect(() => {
        fetchCompanies();
    }, [])
    const fetchCompanies = async () => {
        try {
            let data = await getCompaniesNames();
            setCompanies(data);
        }
        catch (error) {
            console.log(error);
        }
    }
    const fetchContacts = async (search = '') => {
        setIsSearching(true);
        try {
            const data = await contactService.getAllContacts(search);
            setContacts(data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
        setIsSearching(false);
    };

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
        await fetchContacts();
        closeModal();
    };

    const handleEdit = (contactToEdit) => {
        setContact({
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
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            await contactService.deleteContact(id);
            await fetchContacts();
        }
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
                await fetchContacts(); // Refresh the contacts list
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
        setIsModalOpen(true);
    };

    return (
        <div className="contact-container">
            <div className="contact-header">
                <div className="search-container">

                    <Search
                        allowClear
                        placeholder="Search by name, email, or phone..."
                        value={ searchTerm }
                        onChange={ (e) => setSearchTerm(e.target.value) }
                        className="search-input"
                        style={ {
                            width: 200,
                        } }
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
                    />
                    <label htmlFor="csv-upload" className="text-btn">
                        Import CSV
                    </label>
                    <button className="export-btn" onClick={ handleExport }>
                        Export CSV
                    </button>
                    <Button className="add-contact-btn" icon={ <PlusOutlined /> } onClick={ openAddModal }>
                        Add Contact
                    </Button>
                </div>
            </div>

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
                                <td onClick={ () => handleView(contact) }> <a href='#'> { contact?.firstName } { contact?.lastName }</a></td>
                                <td>{ contact?.email }</td>
                                <td>{ contact?.phoneNumber }</td>
                                <td>{ contact?.contactOwner?.name }</td>
                                <td>{ contact?.jobTitle }</td>
                                <td>{ contact?.leadStatus }</td>
                                <td>{ moment(contact?.createdAt).format('DD-MM-YYYY HH:mm') }</td>
                                <td>
                                    {/* <button
                                        className="edit-btn"
                                       
                                    >
                                        View
                                    </button> */}
                                    <button
                                        className="edit-btn"
                                        onClick={ () => handleEdit(contact) }
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={ () => handleDelete(contact._id) }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        )) }
                    </tbody>
                </table>
            </div>

            {/* Modal for Adding/Editing Contact */ }
            { isModalOpen && (
                <div className="modal-overlay edit-contact-model">
                    <div className="modal-content">
                        <h2>{ isEditing ? 'Edit Contact' : 'Create Contact' }</h2>
                        <form onSubmit={ handleSubmit }>
                            <input
                                type="email"
                                name="email"
                                value={ contact.email }
                                onChange={ handleChange }
                                placeholder="Email"
                                required
                            />
                            <input
                                type="text"
                                name="firstName"
                                value={ contact.firstName }
                                onChange={ handleChange }
                                placeholder="First Name"
                            />
                            <input
                                type="text"
                                name="lastName"
                                value={ contact.lastName }
                                onChange={ handleChange }
                                placeholder="Last Name"
                            />
                            <input
                                type="text"
                                name="jobTitle"
                                value={ contact.jobTitle }
                                onChange={ handleChange }
                                placeholder="Job Title"
                            />
                            <input
                                type="text"
                                name="phoneNumber"
                                value={ contact.phoneNumber }
                                onChange={ handleChange }
                                placeholder="Phone Number"
                            />
                            <select
                                name="lifecycleStage"
                                value={ contact.lifecycleStage }
                                onChange={ handleChange }
                            >
                                <option value="Lead">Lead</option>
                                <option value="Customer">Customer</option>
                            </select>
                            <select
                                name="leadStatus"
                                value={ contact.leadStatus }
                                onChange={ handleChange }
                            >
                                <option value="--">--</option>
                                <option value="Qualified">Qualified</option>
                            </select>
                            <select
                                name="company"
                                value={ contact.company }
                                onChange={ handleChange }
                            >
                                <option value="--">Select Company</option>
                                { companies?.map((company) => {
                                    return <option value={ company?._id }>{ company.companyName }</option>
                                }) }
                            </select>
                            <footer className='model-footer'>
                                <button className="close-btn" onClick={ closeModal }>Cancel </button>
                                <button type="submit" className="submit-btn">
                                    { isEditing ? 'Update Contact' : 'Create Contact' }
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            ) }
        </div>
    );
};

export default ContactListAndAdd;