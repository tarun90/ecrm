import React, { useEffect, useState } from 'react';
import { message, Popconfirm, Button, Input, Modal, Form, Drawer } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from './campaignService';
import './campaigns.css';
import { Header } from 'antd/es/layout/layout';
import { Delete, Edit, Search } from 'lucide-react';

const CampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editId, setEditId] = useState(null);
    const [campaignName, setCampaignName] = useState('');
    const [form] = Form.useForm();
    const { Search } = Input;

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
            <Header className="contact-header">
                <div className="search-container">
                    <div className='heading'>
                        <h1>Campaigns</h1>
                    </div>
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
                        <PlusOutlined />
                        Add Campaign
                    </button>
                </div>
            </Header>

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
                                    <div className='action-buttons'>
                                        <button className='edit-btn' onClick={ () => handleEditCampaign(campaign._id, campaign.campaignName) } ><EditOutlined /></button>
                                        <Popconfirm
                                            title="Delete Campaign"
                                            description="Are you sure you want to delete this campaign?"
                                            onConfirm={ () => handleDelete(campaign._id) }
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <button className='delete-btn'><DeleteOutlined /></button>
                                        </Popconfirm>
                                    </div>
                                </td>
                            </tr>
                        )) }
                    </tbody>
                </table>
            </div>

            <Drawer
                title={ editId ? "Edit Campaign" : "Add Campaign" }
                open={ modalVisible }
                onClose={ () => setModalVisible(false) }
                width={ 400 } // Adjust width as needed
                footer={
                    <div className='modal-footer'>
                        <Button onClick={ () => setModalVisible(false) } className='text-btn'>Cancel</Button>
                        <Button type="primary" onClick={ () => form.submit() }>Ok</Button>
                    </div>
                }
            >
                <Form
                    form={ form }
                    layout="vertical"
                    onFinish={ handleSubmit } // Called when the form is submitted
                >
                    <Form.Item
                        label="Campaign Name"
                        rules={ [{ required: true, message: "Please enter campaign name" }] }
                    >
                        <Input
                            value={ campaignName }
                            onChange={ (e) => setCampaignName(e.target.value) }
                            placeholder="Enter Campaign Name"
                        />
                    </Form.Item>
                </Form>

            </Drawer>


        </div>
    );
};

export default CampaignList;
