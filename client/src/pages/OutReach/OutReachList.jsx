import React, { useEffect, useState } from 'react';
import { message, Popconfirm, Button, Input, Modal, Select, Checkbox, Upload } from 'antd';
import { UploadOutlined, FileExcelOutlined, BarChartOutlined, InboxOutlined } from '@ant-design/icons';
import { getCampaigns } from '../Campaigns/campaignService';
import { getRegions } from '../Regions/RegionsService';
import './outreach.css';

const { Dragger } = Upload;

const OutReachList = () => {
    const [outreach, setOutreach] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [regions, setRegions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [selectedOutreach, setSelectedOutreach] = useState([]);
    const [importData, setImportData] = useState({
        campaign: undefined,
        region: '',
        file: null
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        website: '',
        linkedin: '',
        country: '',
        status: 'New',
        region: '',
        campaign: '',
    });

    useEffect(() => {
        fetchOutreach();
        fetchCampaigns();
        fetchRegions();
    }, [searchTerm]);

    const fetchCampaigns = async () => {
        try {
            const data = await getCampaigns();
            setCampaigns(data);
        } catch (error) {
            message.error('Failed to fetch campaigns');
        }
    };

    const fetchOutreach = async () => {
        // TODO: Implement API call
        // const data = await getOutreach(searchTerm);
        // setOutreach(data);
    };

    const handleImportCSV = () => {
        setImportModalVisible(true);
    };

    const handleImportSubmit = async () => {
        if (!importData.campaign) {
            message.error('Please select a campaign');
            return;
        }
        if (!importData.region) {
            message.error('Please select a region');
            return;
        }
        if (!importData.file) {
            message.error('Please upload a CSV file');
            return;
        }

        // TODO: Implement the actual import logic here
        message.success('CSV import started');
        setImportModalVisible(false);
        setImportData({
            campaign: undefined,
            region: '',
            file: null
        });
    };

    const uploadProps = {
        accept: '.csv',
        beforeUpload: (file) => {
            setImportData(prev => ({ ...prev, file }));
            return false; // Prevent automatic upload
        },
        onRemove: () => {
            setImportData(prev => ({ ...prev, file: null }));
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
        label: region.regionName
    }));

    const handleAddOutreach = () => {
        setModalVisible(true);
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
        // TODO: Implement outreach creation/update logic
        message.success('Outreach added successfully');
        setModalVisible(false);
        fetchOutreach();
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
                                <td>{item.name}</td>
                                <td>{item.email}</td>
                                <td>{item.phone}</td>
                                <td>{item.website}</td>
                                <td>{item.linkedin}</td>
                                <td>{item.country}</td>
                                <td>{item.status}</td>
                                <td>{item.region}</td>
                                <td>{item.campaign}</td>
                                <td>{item.createdBy}</td>
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
                        value={formData.status}
                        onChange={(value) => setFormData({...formData, status: value})}
                        placeholder="Status"
                        className="form-input"
                    >
                        <Select.Option value="New">New</Select.Option>
                        <Select.Option value="In Progress">In Progress</Select.Option>
                        <Select.Option value="Contacted">Contacted</Select.Option>
                        <Select.Option value="Qualified">Qualified</Select.Option>
                        <Select.Option value="Not Interested">Not Interested</Select.Option>
                    </Select>
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
                </div>
            </Modal>

            {/* Import CSV Modal */}
            <Modal
                title="Import CSV"
                open={importModalVisible}
                onCancel={() => {
                    setImportModalVisible(false);
                    setImportData({
                        campaign: undefined,
                        region: '',
                        file: null
                    });
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
                        className="form-input"
                        placeholder="Select Region"
                        value={importData.region}
                        onChange={(value) => setImportData(prev => ({ ...prev, region: value }))}
                        options={regionOptions}
                    />
                    
                    <Dragger {...uploadProps} className="csv-uploader">
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