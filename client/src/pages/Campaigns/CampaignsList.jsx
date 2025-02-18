import React, { useEffect, useState } from 'react';
import { message, Popconfirm, Button, Input, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from './campaignService';
import './campaigns.css';

const CampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editId, setEditId] = useState(null);
    const [campaignName, setCampaignName] = useState('');

    useEffect(() => {
        fetchCampaigns();
    }, [searchTerm]);

    const fetchCampaigns = async () => {
        const data = await getCampaigns(searchTerm);
        setCampaigns(data);
    };

    const handleAddCampaign = () => {
        setEditId(null);
        setCampaignName('');
        setModalVisible(true);
    };

    const handleEditCampaign = (id, name) => {
        setEditId(id);
        setCampaignName(name);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        const deleteResponse = await deleteCampaign(id);
        if (deleteResponse?.status !== 200) {
            message.error(deleteResponse?.message);
        } else {
            message.success("Campaign deleted successfully");
            fetchCampaigns();
        }
    };

    const handleSubmit = async () => {
        if (!campaignName.trim()) {
            message.error('Campaign name cannot be empty');
            return;
        }

        if (editId) {
            await updateCampaign(editId, { campaignName });
            message.success('Campaign updated successfully');
        } else {
            await createCampaign({ campaignName });
            message.success('Campaign created successfully');
        }

        setModalVisible(false);
        fetchCampaigns();
    };

    return (
        <div className="campaign-container">
            <div className="contact-header">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search Campaign..."
                        value={ searchTerm }
                        onChange={ (e) => setSearchTerm(e.target.value) }
                        className="search-input"
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
                    <button className="add-contact-btn" onClick={ handleAddCampaign }>
                        Add Campaign
                    </button>
                </div>
            </div>
            <div className="contact-table">
                <table>
                    <thead>
                        <tr>
                            <th>Campaign Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        { campaigns.map(campaign => (
                            <tr key={ campaign._id }>
                                <td>{ campaign.campaignName }</td>
                                <td>
                                    <Button className='edit-btn' onClick={ () => handleEditCampaign(campaign._id, campaign.campaignName) }>Edit</Button>
                                    <Popconfirm
                                        title="Delete Campaign"
                                        description="Are you sure you want to delete this campaign?"
                                        onConfirm={ () => handleDelete(campaign._id) }
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button className='delete-btn'>Delete</Button>
                                    </Popconfirm>
                                </td>
                            </tr>
                        )) }
                    </tbody>
                </table>
            </div>
            <Modal
                title={ editId ? "Edit Campaign" : "Add Campaign" }
                open={ modalVisible }
                onCancel={ () => setModalVisible(false) }
                onOk={ handleSubmit }
            >
                <Input
                    value={ campaignName }
                    onChange={ (e) => setCampaignName(e.target.value) }
                    placeholder="Enter Campaign Name"
                />
            </Modal>
        </div>
    );
};

export default CampaignList;
