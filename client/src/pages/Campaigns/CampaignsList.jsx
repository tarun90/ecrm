import React, { useEffect, useState } from 'react';
import { message, Popconfirm, Button, Input, Modal, Form, Drawer, Select } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign, getCategories } from './campaignService';
import './campaigns.css';
import { Header } from 'antd/es/layout/layout';
import { Delete, Edit, Search } from 'lucide-react';
import NoDataUI from '../../components/NoData';

const CampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editId, setEditId] = useState(null);
    const [campaignName, setCampaignName] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [form] = Form.useForm();
    const { Search } = Input;

    useEffect(() => {
        fetchCampaigns();
        fetchCategories();
    }, [searchTerm]);

    const fetchCategories = async () => {
        const data = await getCategories();
        setCategories(data);
    };

    const fetchCampaigns = async () => {
        const data = await getCampaigns(searchTerm);
        setCampaigns(data);
    };
    const handleAddCampaign = () => {
        setEditId(null);
        setCampaignName('');
        setSelectedCategory(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditCampaign = (campaign) => {
        console.log(campaign, "ketul campaign")
        setEditId(campaign._id);
        setCampaignName(campaign.campaignName);
        setSelectedCategory(campaign.categoryId?._id);
        form.setFieldsValue({
            campaignName: campaign.campaignName,
            categoryId: campaign.categoryId?._id
        });
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
        try {
            const values = await form.validateFields();
            if (!values.campaignName.trim()) {
                message.error('Campaign name cannot be empty');
                return;
            }

            const campaignData = {
                campaignName: values.campaignName,
                categoryId: values.categoryId
            };

            if (editId) {
                await updateCampaign(editId, campaignData);
                message.success('Campaign updated successfully');
            } else {
                await createCampaign(campaignData);
                message.success('Campaign created successfully');
            }

            setModalVisible(false);
            fetchCampaigns();
        } catch (error) {
            console.error('Form validation failed:', error);
        }
    };
    return (
        <div className="campaign-container">
            <Header className="contact-header">
                <div className="search-container">
                    <div className='heading'>
                        <h1>Datasets</h1>
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
                        Add Dataset
                    </button>
                </div>
            </Header>
            { !campaigns || campaigns?.length == 0 ? <NoDataUI /> : <>
                <div className='global-search'>
                    <Search
                        allowClear
                        placeholder="Search Dataset..."
                        value={ searchTerm }
                        onChange={ (e) => setSearchTerm(e.target.value) }
                        className="search-input"
                    />
                </div>
                <div className="contact-table">

                    <table>
                        <thead>
                            <tr>
                                <th>Dataset Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            { campaigns.map(campaign => (
                                <tr key={ campaign._id }>
                                    <td>{ campaign.campaignName }</td>
                                    <td>
                                        <div className='action-buttons'>
                                            <button className='edit-btn' onClick={ () => handleEditCampaign(campaign) } ><EditOutlined /></button>
                                            <Popconfirm
                                                title="Delete Dataset"
                                                description="Are you sure you want to delete this Dataset?"
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
            </> }

            <Drawer
                title={editId ? "Edit Dataset" : "Add dataset"}
                open={modalVisible}
                onClose={() => {setModalVisible(false)
                    form.resetFields();
                }}
                width={400}
                footer={
                    <div className='modal-footer'>
                        <Button onClick={() => setModalVisible(false)} className='text-btn'>
                            Cancel
                        </Button>
                        <Button type="primary" onClick={() => form.submit()}>
                            Ok
                        </Button>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="campaignName"
                        label="Dataset Name"
                        rules={[{ required: true, message: "Please enter dataset name" }]}
                    >
                        <Input
                            placeholder="Enter Dataset Name"
                        />
                    </Form.Item>

                    <Form.Item
                        name="categoryId"
                        label="Category"
                        rules={[{ required: true, message: "Please select a category" }]}
                    >
                        <Select
                            placeholder="Select a category"
                            options={categories.map(category => ({
                                value: category._id,
                                label: category.categoryName
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Drawer>


        </div>
    );
};

export default CampaignList;
