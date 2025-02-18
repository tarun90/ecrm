import React, { useEffect, useState } from 'react';
import { message, Popconfirm, Button, Input, Modal, Select, Checkbox, Upload } from 'antd';
import { UploadOutlined, FileExcelOutlined, BarChartOutlined, InboxOutlined } from '@ant-design/icons';
import { getUsers } from '../Users/userService';  // Add this import
import { getCampaigns } from '../Campaigns/campaignService';
import { getRegions } from '../Regions/RegionsService';
import './outreach.css';
import { getCategories } from '../Categories/categoryService';
import { 
    getOutreach, 
    createOutreach, 
    updateOutreach, 
    deleteOutreach, 
    importCSV,
    assignOutreach 
} from './outreachService';
const { Dragger } = Upload;

const OutReachList = () => {
    const [outreach, setOutreach] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [categories, setCategories] = useState([]);
    const [regions, setRegions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [selectedOutreach, setSelectedOutreach] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [users, setUsers] = useState([]);
    
    const [importData, setImportData] = useState({
        campaign: undefined,
        region: '',
        category: undefined,
        file: null
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        website: '',
        linkedin: '',
        country: '',
        region: '',
        campaign: '',
        category: '',
    });

    useEffect(() => {
        fetchOutreach();
        fetchCampaigns();
        fetchRegions();
        fetchCategories();
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchOutreach();
       
    }, [searchTerm]);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            console.log(data)
            setUsers(data?.users);
        } catch (error) {
            message.error('Failed to fetch users');
        }
    };

    const fetchCampaigns = async () => {
        try {
            const data = await getCampaigns();
            setCampaigns(data);
        } catch (error) {
            message.error('Failed to fetch campaigns');
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            message.error('Failed to fetch campaigns');
        }
    };

    const fetchOutreach = async () => {
        try {
            setLoading(true);
            const data = await getOutreach();
            setOutreach(data);
        } catch (error) {
            message.error('Failed to fetch outreach data');
        } finally {
            setLoading(false);
        }
    };

    const handleImportCSV = () => {
        setImportData({
            campaign: undefined,
            region: '',
            category: undefined,
            file: null
        });
        setFileList([]);
        setImportModalVisible(true);
    };

    const handleImportSubmit = async () => {
        try {
            console.log(importData,"ketul")
            if (!importData.campaign || !importData.region || !importData.category || !importData.file) {
                message.error('Please fill in all required fields');
                return;
            }

            const formData = new FormData();
            formData.append('file', importData.file);
            formData.append('campaign', importData.campaign);
            formData.append('region', importData.region);
            formData.append('category', importData.category);

            setLoading(true);
            await importCSV(formData);
            message.success('CSV imported successfully');
            setImportModalVisible(false);
            fetchOutreach(); // Refresh the list
           
            // Reset import form
            setImportData({
                campaign: undefined,
                region: '',
                category: undefined,
                file: null
            });
          
        } catch (error) {
            message.error('Failed to import CSV');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        accept: '.csv',
        beforeUpload: (file) => {
            setImportData(prev => ({ ...prev, file }));
            setFileList([file]);
            return false; // Prevent automatic upload
        },
        // onChange: ({ file }) => {
        //     if (file.status === 'done') {
        //         setImportData(prev => ({ ...prev, file: null })); // Clear file after processing
        //         setFileList([]);
        //     }
        // },
        onRemove: () => {
            setImportData(prev => ({ ...prev, file: null }));
            return true; 
        },
    };

    const fetchRegions = async () => {
        try {
            const data = await getRegions();
            setRegions(data);
        } catch (error) {
            message.error('Failed to fetch regions');
        }
    };

    const regionOptions = regions.map(region => ({
        value: region._id,
        label: region?.regionName
    }));
    const handleAddOutreach = () => {
        setEditMode(false);
        setEditId(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            website: '',
            linkedin: '',
            country: '',
            region: '',
            campaign: '',
            category: '',
        });
        setModalVisible(true);
    };

    const handleEditOutreach = (id) => {
        const outreachItem = outreach.find(item => item._id === id);
        if (outreachItem) {
            setFormData({
                name: outreachItem.name,
                email: outreachItem.email,
                phone: outreachItem.phone,
                website: outreachItem.website,
                linkedin: outreachItem.linkedin,
                country: outreachItem.country,
                region: outreachItem.region._id,
                campaign: outreachItem.campaign._id,
                category: outreachItem.category._id,
            });
            setEditMode(true);
            setEditId(id);
            setModalVisible(true);
        }
    };
    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await deleteOutreach(id);
            message.success('Outreach deleted successfully');
            fetchOutreach();
        } catch (error) {
            message.error('Failed to delete outreach');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedOutreach(prev => {
            if (prev.includes(id)) {
                return prev.filter(outreachId => outreachId !== id);
            }
            return [...prev, id];
        });
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedOutreach(outreach.map(item => item._id));
        } else {
            setSelectedOutreach([]);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            if (editMode) {
                await updateOutreach(editId, formData);
                message.success('Outreach updated successfully');
            } else {
                await createOutreach(formData);
                message.success('Outreach created successfully');
            }
            setModalVisible(false);
            fetchOutreach();
        } catch (error) {
            message.error(editMode ? 'Failed to update outreach' : 'Failed to create outreach');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignOutreach = async (userId) => {
        if (selectedOutreach.length === 0) {
            message.warning('Please select outreach items to assign');
            return;
        }

        try {
            setLoading(true);
            await assignOutreach(selectedOutreach, userId);
            message.success('Outreach assigned successfully');
            fetchOutreach();
            setSelectedOutreach([]);
        } catch (error) {
            message.error('Failed to assign outreach');
        } finally {
            setLoading(false);
        }
    };

    const handleViewReports = () => {
        // TODO: Implement reports view
        message.info('Reports feature coming soon');
    };

    return (
        <div className="outreach-container">
            <div className="outreach-header">
                <div className="search-container">
                    <Input
                        type="text"
                        placeholder="Search Outreach..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="action-buttons">
                    <Button 
                        onClick={handleImportCSV}
                        icon={<UploadOutlined />}
                        className="import-btn"
                    >
                        Import CSV
                    </Button>
                    <Button 
                        type="primary"
                        onClick={handleAddOutreach}
                        className="add-outreach-btn"
                    >
                        Add Outreach
                    </Button>
                    <Button 
                        onClick={handleViewReports}
                        icon={<BarChartOutlined />}
                        className="reports-btn"
                    >
                        Reports
                    </Button>
                </div>
            </div>
            {selectedOutreach.length > 0 && (
    <div className="assignment-section" style={{ 
        padding: '16px', 
        background: '#f5f5f5', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderRadius: '4px'
    }}>
        <span style={{ fontWeight: 500 }}>
            {selectedOutreach.length} items selected
        </span>
        <Select
            style={{ width: 200 }}
            showSearch
            placeholder="Assign to user"
            onChange={handleAssignOutreach}
            allowClear
            filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            optionFilterProp="children"
        >
            {users.map(user => (
                <Select.Option key={user._id} value={user._id}>
                    {user.name}
                </Select.Option>
            ))}
        </Select>
        {/* <Button 
            onClick={() => setSelectedOutreach([])}
            size="small"
        >
            Clear Selection
        </Button> */}
    </div>
)}
            <div className="outreach-table">
                <table>
                    <thead>
                        <tr>
                            <th>
                                <Checkbox
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    checked={selectedOutreach.length === outreach.length}
                                />
                            </th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Website</th>
                            <th>LinkedIn</th>
                            <th>Country</th>
                            <th>Status</th>
                            <th>Region</th>
                            <th>Campaign</th>
                            <th>Category</th>
                            <th>Assigned To</th>
                            <th>Created By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {outreach.map(item => (
                            <tr key={item._id}>
                                <td>
                                    <Checkbox
                                        checked={selectedOutreach.includes(item._id)}
                                        onChange={() => handleCheckboxChange(item._id)}
                                    />
                                </td>
                                <td>{item?.name}</td>
                                <td>{item?.email}</td>
                                <td>{item?.phone}</td>
                                <td>{item?.website}</td>
                                <td>{item?.linkedin}</td>
                                <td>{item?.country}</td>
                                <td>{item?.status}</td>
                                <td>{item?.region?.regionName}</td>
                                <td>{item?.campaign?.campaignName}</td>
                                <td>{item?.category?.categoryName}</td>
                                <td>{item?.assignedTo?.name ? item?.assignedTo.name : "-" }</td>
                                <td>{item?.createdBy?.name}</td>
                                <td>
                                    <Button onClick={() => handleEditOutreach(item._id)}>Edit</Button>
                                    <Popconfirm
                                        title="Delete Outreach"
                                        description="Are you sure you want to delete this outreach?"
                                        onConfirm={() => handleDelete(item._id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button danger>Delete</Button>
                                    </Popconfirm>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Outreach Modal */}
            <Modal
                title="Add Outreach"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                width={600}
            >
                <div className="outreach-form">
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Name"
                        className="form-input"
                    />
                    <Input
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Email"
                        className="form-input"
                    />
                    <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="Phone"
                        className="form-input"
                    />
                    <Input
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="Website"
                        className="form-input"
                    />
                    <Input
                        value={formData.linkedin}
                        onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                        placeholder="LinkedIn"
                        className="form-input"
                    />
                    <Input
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        placeholder="Country"
                        className="form-input"
                    />
                 
                    <Select
                        value={formData.region}
                        onChange={(value) => setFormData({...formData, region: value})}
                        placeholder="Region"
                        className="form-input"
                        options={regionOptions}
                    />
                    <Select
                        value={formData.campaign}
                        onChange={(value) => setFormData({...formData, campaign: value})}
                        placeholder="Campaign"
                        className="form-input"
                    >
                        {campaigns.map(campaign => (
                            <Select.Option key={campaign._id} value={campaign._id}>
                                {campaign.campaignName}
                            </Select.Option>
                        ))}
                    </Select>

                    <Select
                        value={formData.category}
                        onChange={(value) => setFormData({...formData, category: value})}
                        placeholder="Category"
                        className="form-input"
                    >
                        {categories.map(category => (
                            <Select.Option key={category._id} value={category._id}>
                                {category.categoryName}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </Modal>

            {/* Import CSV Modal */}
            <Modal
             destroyOnClose={true} 
                title="Import CSV"
                open={importModalVisible}
                onCancel={() => {
                    setImportModalVisible(false);
                    setImportData({
                        campaign: undefined,
                        region: '',
                        file: null,
                        category: undefined
                    });
                    // Clear the file from Dragger
                    if (uploadProps.onChange) {
                        uploadProps.onChange({ fileList: [] });
                    }
                }}
                onOk={handleImportSubmit}
                width={500}
            >
                <div className="import-form">
                    <Select
                        className="form-input"
                        placeholder="Select Campaign"
                        value={importData.campaign}
                        onChange={(value) => setImportData(prev => ({ ...prev, campaign: value }))}
                    >
                        {campaigns.map(campaign => (
                            <Select.Option key={campaign._id} value={campaign._id}>
                                {campaign.campaignName}
                            </Select.Option>
                        ))}
                    </Select>

                    
                    <Select
                        value={importData.category}
                        onChange={(value) => setImportData(prev => ({ ...prev, category: value }))}
                        placeholder="Select Category"
                        className="form-input"
                    >
                        {categories.map(category => (
                            <Select.Option key={category._id} value={category._id}>
                                {category.categoryName}
                            </Select.Option>
                        ))}
                    </Select>
                    
                    <Select
                        className="form-input"
                        placeholder="Select Region"
                        value={importData.region}
                        onChange={(value) => setImportData(prev => ({ ...prev, region: value }))}
                        options={regionOptions}
                    />
                    
                    <Dragger {...uploadProps} className="csv-uploader"  key={importModalVisible.toString()}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
                        <p className="ant-upload-hint">
                            Support for single CSV file upload
                        </p>
                    </Dragger>
                </div>
            </Modal>
        </div>
    );
};

export default OutReachList;