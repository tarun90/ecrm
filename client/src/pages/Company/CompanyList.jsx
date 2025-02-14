import React, { useEffect, useState } from 'react';
import './company.css';
import moment from 'moment';
import axios from 'axios';
import { getCompanies, deleteCompany } from './APIServices';
import { useNavigate } from 'react-router-dom';
import { message, Popconfirm } from 'antd';
import CompanyFormModal from './CompanyFormModal';
const CompanyList = () => {
    const navigate = useNavigate();

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
            <div className="contact-header">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setsearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {/* { isSearching && <span className="searching-indicator">Searching...</span> } */}
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
                    <button className="add-contact-btn"  onClick={handleAddCompany}>
                        Add Company
                    </button>
                </div>
            </div>
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
            {companies.map(company => (
                <tr key={company?._id}>
                    <td>{company?.companyName || '-'}</td>
                    <td>{company?.companyOwner || '-'}</td>
                    <td>{company?.phoneNumber || '-'}</td>
                    <td>{company?.email || '-'}</td>
                    <td>{company?.city || '-'}</td>
                    <td>{company?.country || '-'}</td>
                    <td>
                        <button className="edit-btn" onClick={() => handleView(company._id)}>
                            View
                        </button>
                        <button className="edit-btn" onClick={() => handleEditCompany(company._id)}>
                            Edit
                        </button>
                        <Popconfirm
                          title="Delete Company"
                          description="Are you sure you want to delete this company?"
                          onConfirm={(e) => {
                            e.stopPropagation();
                            handleDelete(company._id);
                          }}
                          okText="Yes"
                          cancelText="No"
                        >
                            <button className="delete-btn" onClick={(e) => e.stopPropagation()}>
                                Delete
                            </button>
                        </Popconfirm>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>


            {/* Modal for Adding/Editing Contact */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditing ? 'Edit Company' : 'Create Company'}</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="email"
                                name="email"
                                value={contact.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                            />
                            <input
                                type="text"
                                name="firstName"
                                value={contact.firstName}
                                onChange={handleChange}
                                placeholder="First Name"
                            />
                            <input
                                type="text"
                                name="lastName"
                                value={contact.lastName}
                                onChange={handleChange}
                                placeholder="Last Name"
                            />
                            <input
                                type="text"
                                name="jobTitle"
                                value={contact.jobTitle}
                                onChange={handleChange}
                                placeholder="Job Title"
                            />
                            <input
                                type="text"
                                name="phoneNumber"
                                value={contact.phoneNumber}
                                onChange={handleChange}
                                placeholder="Phone Number"
                            />
                            <select
                                name="lifecycleStage"
                                value={contact.lifecycleStage}
                                onChange={handleChange}
                            >
                                <option value="Lead">Lead</option>
                                <option value="Customer">Customer</option>
                            </select>
                            <select
                                name="leadStatus"
                                value={contact.leadStatus}
                                onChange={handleChange}
                            >
                                <option value="--">--</option>
                                <option value="Qualified">Qualified</option>
                            </select>
                            <footer className='model-footer'>
                                <button className="close-btn" onClick={closeModal}>Cancel </button>
                                <button type="submit" className="submit-btn">
                                    {isEditing ? 'Update Contact' : 'Create Contact'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
             <CompanyFormModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        editId={editId}
        fetchCompanies={fetchCompanies}
      />
        </div>
    );
};

export default CompanyList;