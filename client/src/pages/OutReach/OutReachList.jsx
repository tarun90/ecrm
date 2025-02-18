import React, { useEffect, useState } from 'react';
import { message, Popconfirm, Button, Input, Modal, Select, Checkbox, Upload, Form, Row, Col, Divider } from 'antd';
import { UploadOutlined, FileExcelOutlined, BarChartOutlined, InboxOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
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
import { Header } from 'antd/es/layout/layout';
import { Link } from 'react-router-dom';
import { Getcountry } from '../Company/APIServices';
import axios from 'axios';
const { Dragger } = Upload;
const API_URL = import.meta.env.VITE_TM_API_URL;

const OutReachList = () => {
    let userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {}
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
    const [dropdownData, setDropdownData] = useState({
        countries: [],
        statuses: [],
        regions: [],
        campaigns: [],
        categories: [],
        assignToUsers: [],
    });
    const [form] = Form.useForm();
    const [country, setCountry] = useState([])
    const [filterModal, setfilterModal] = useState(false)
    const [UserData, setUserData] = useState([])
    const [filterData, setFilteredData] = useState([])
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

    }, []);

    const fetchUsers = async () => {
        try {
            let userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {}
            let regionId = userData?.regionId || "";
            const data = await getUsers(regionId);
            console.log(data)
            setUsers(data?.users);
        } catch (error) {
            // message.error('Failed to fetch users');
        }
    };

    const fetchCampaigns = async () => {
        try {
            const data = await getCampaigns();
            setCampaigns(data);
        } catch (error) {
            // message.error('Failed to fetch campaigns');
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            // message.error('Failed to fetch campaigns');
        }
    };

    const fetchOutreach = async () => {
        try {
            setLoading(true);
            const data = await getOutreach();
            setOutreach(data);
        } catch (error) {
            // message.error('Failed to fetch outreach data');
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
            console.log(importData, "ketul")
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
            // message.error('Failed to fetch regions');
        }
    };

    const regionOptions = regions.map(region => ({
        value: region._id,
        label: region?.regionName
    }));
    const handleAddOutreach = () => {
        setEditMode(false);
        setEditId(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditOutreach = (id) => {
        const outreachItem = outreach.find(item => item._id === id);
        if (outreachItem) {
            form.setFieldsValue({
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

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            if (editMode) {
                await updateOutreach(editId, values);
                message.success('Outreach updated successfully');
            } else {
                await createOutreach(values);
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
            // message.error('Failed to assign outreach');
        } finally {
            setLoading(false);
        }
    };

    const handleViewReports = () => {
        // TODO: Implement reports view
        message.info('Reports feature coming soon');
    };
    //country data fetch
    const fetchCountry = async () => {
        try {
            let data = await Getcountry();
            setCountry(data.data);
        } catch (error) {
            console.log(error);

        }
    }

    const handleFilterSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields(); // Get form values

            // ✅ API request
            const response = await axios.post(
                `${API_URL}/api/outreach/filter`,
                values,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`, // Auth token
                    },
                }
            );

            // ✅ Update filtered data
            setFilteredData(response.data);
            setOutreach(response?.data)

            console.log(response.data, 'response.data');
            message.success("Filters applied successfully!");
            setfilterModal(false)
            form.resetFields()
        } catch (error) {
            console.error("Error filtering outreach:", error);
            message.error("Failed to apply filters.");
        } finally {
            setLoading(false);
        }
    };

    console.log(filterData, 'filterData');
    const getUsersData = async () => {
        try {
            let userdata = await getUsers()
            console.log(userdata);

            setUserData(userdata.users)

        } catch (error) {
            console.log(error);

        }
    }
    useEffect(() => {
        fetchCountry()
        getUsersData()
    }, [])
    return (
        <div className="outreach-container">
            <Header className="outreach-header">
                <div className="outreach-header-wrapper">
                    <div className="search-container">
                        <Input
                            type="text"
                            placeholder="Search Outreach..."
                            value={ searchTerm }
                            onChange={ (e) => setSearchTerm(e.target.value) }
                            className="search-input"
                        />
                    </div>
                    <Button className='filter-btn btn' onClick={ () => { setfilterModal(true) } }>Filter</Button>
                    {/* <Button disabled={filterData==[]} type='primary' onClick={()=>{fetchOutreach()}}>Reset Filter</Button> */ }
                    <Button
                        disabled={ !filterData } // Disable if no filtered data
                    className='delete-btn btn'
                        onClick={ () => { fetchOutreach(); setFilteredData() } }
                    >
                        Reset Filter
                    </Button>
                    { selectedOutreach.length > 0 && (
                        <div className="assignment-section">
                            <span style={ { fontWeight: 500, marginRight: "10px" } }>
                                Assign Outreach To : &nbsp;
                            </span>
                            <Select
                                style={ { width: 200 } }
                                showSearch
                                placeholder="Assign to user"
                                onChange={ handleAssignOutreach }
                                allowClear
                                filterOption={ (input, option) =>
                                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                optionFilterProp="children"
                            >
                                { users.map(user => (
                                    <Select.Option key={ user._id } value={ user._id }>
                                        { user.name }
                                    </Select.Option>
                                )) }
                            </Select>
                            <span style={ { fontWeight: 500, marginLeft: "10px" } }>
                                { selectedOutreach.length } outreach selected
                            </span>


                        </div>
                    ) }

                </div>
                <div className="action-buttons">
                    { userData?.department?.name == "Lead Generation" && <>
                        <Button
                            onClick={ handleImportCSV }
                            icon={ <UploadOutlined /> }
                            className="import-btn"
                        >
                            Import CSV
                        </Button>
                        <Button
                            type="primary"
                            onClick={ handleAddOutreach }
                            className="add-outreach-btn"
                        >
                            Add Outreach
                        </Button> </> }
                    {/* <Button 
                        onClick={handleViewReports}
                        icon={<BarChartOutlined />}
                        className="reports-btn"
                    >
                        Reports
                    </Button> */}
                </div>

            </Header>
            <div className="contact-table">
                <table>
                    <thead>
                        <tr>
                            { userData?.isRegionHead &&
                                <th>
                                    <Checkbox
                                        onChange={ (e) => handleSelectAll(e.target.checked) }
                                        checked={ selectedOutreach.length === outreach.length }
                                    />
                                </th>
                            }
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
                            { userData?.department?.name == "Lead Generation" && <th>Actions</th> }
                        </tr>
                    </thead>
                    <tbody>

                        { outreach.map(item => (
                            <tr key={ item._id }>
                                { userData?.isRegionHead &&
                                    <td>
                                        <Checkbox
                                            checked={ selectedOutreach.includes(item._id) }
                                            onChange={ () => handleCheckboxChange(item._id) }
                                        />
                                    </td>
                                }
                                <td><Link to={ `/ViewOutReach/${item._id}` }>
                                    <span className='user-name'>{ item.name }</span></Link></td>
                                <td>{ item?.email }</td>
                                <td>{ item?.phone }</td>
                                <td>{ item?.website }</td>
                                <td>{ item?.linkedin }</td>
                                <td>{ item?.country }</td>
                                <td>{ item?.status }</td>
                                <td>{ item?.region?.regionName }</td>
                                <td>{ item?.campaign?.campaignName }</td>
                                <td>{ item?.category?.categoryName }</td>
                                <td>{ item?.assignedTo?.name ? item?.assignedTo.name : "-" }</td>
                                <td>{ item?.createdBy?.name }</td>
                                { userData?.department?.name == "Lead Generation" &&
                                    <td>
                                        <div className='action-buttons'>
                                            <button className='edit-btn' onClick={ () => handleEditOutreach(item._id) }><EditOutlined /></button>
                                            <Popconfirm
                                                title="Delete Outreach"
                                                description="Are you sure you want to delete this outreach?"
                                                onConfirm={ () => handleDelete(item._id) }
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <button className='delete-btn'><DeleteOutlined /></button>
                                            </Popconfirm>
                                        </div>
                                    </td>
                                }
                            </tr>
                        )) }
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Outreach Modal */ }
            <Modal
                title={ editMode ? "Edit Outreach" : "Add Outreach" }
                open={ modalVisible }
                onCancel={ () => setModalVisible(false) }
                footer={ null }  // We'll use Ant Design's Form submission
                width={ 600 }
                maskClosable={ false }
            >
                <Divider />
                <Form
                    form={ form }
                    onFinish={ handleSubmit }
                    layout="vertical"
                    initialValues={ {
                        name: '',
                        email: '',
                        phone: '',
                        website: '',
                        linkedin: '',
                        country: '',
                        region: '',
                        campaign: '',
                        category: '',
                    } }
                >
                    <Row gutter={ 16 } >
                        <Col span={ 12 }>
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={ [{ required: true, message: 'Please input the name!' }] }
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={ [{ required: true, type: 'email', message: 'Please input a valid email!' }] }
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Phone"
                                name="phone"
                                rules={ [{ required: true, message: 'Please input the phone number!' }] }
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Website"
                                name="website"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="LinkedIn"
                                name="linkedin"
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={ 12 }>
                            <Form.Item
                                label="Country"
                                name="country"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Region"
                                name="region"
                                rules={ [{ required: true, message: 'Please select the region!' }] }
                            >
                                <Select options={ regionOptions } />
                            </Form.Item>

                            <Form.Item
                                label="Campaign"
                                name="campaign"
                                rules={ [{ required: true, message: 'Please select a campaign!' }] }
                            >
                                <Select>
                                    { campaigns.map(campaign => (
                                        <Select.Option key={ campaign._id } value={ campaign._id }>
                                            { campaign.campaignName }
                                        </Select.Option>
                                    )) }
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Category"
                                name="category"
                                rules={ [{ required: true, message: 'Please select a category!' }] }
                            >
                                <Select>
                                    { categories.map(category => (
                                        <Select.Option key={ category._id } value={ category._id }>
                                            { category.categoryName }
                                        </Select.Option>
                                    )) }
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider />
                    <Form.Item>
                        <Button onClick={ () => setModalVisible(false) } className="text-btn">
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={ loading }
                            style={ { width: '100%' } }
                        >
                            { editMode ? "Update" : "Create" } Outreach
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Import CSV Modal */ }
            <Modal
                destroyOnClose={ true }
                title="Import CSV"
                open={ importModalVisible }
                onCancel={ () => {
                    setImportModalVisible(false);
                    setImportData({
                        campaign: undefined,
                        region: '',
                        file: null,
                        category: undefined,
                    });
                    // Clear the file from Dragger
                    if (uploadProps.onChange) {
                        uploadProps.onChange({ fileList: [] });
                    }
                } }
                onOk={ handleImportSubmit }
                width={ 600 }
            >
                <Divider />
                <div className="import-form">
                    <Row gutter={ 16 }>
                        <Col span={ 12 }>
                            <Form.Item label="Campaign" style={ { marginBottom: 16 } }>
                                <Select
                                    placeholder="Select Campaign"
                                    value={ importData.campaign }
                                    onChange={ (value) => setImportData((prev) => ({ ...prev, campaign: value })) }
                                    style={ { width: '100%' } }
                                >
                                    { campaigns.map((campaign) => (
                                        <Select.Option key={ campaign._id } value={ campaign._id }>
                                            { campaign.campaignName }
                                        </Select.Option>
                                    )) }
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={ 12 }>
                            <Form.Item label="Category" style={ { marginBottom: 16 } }>
                                <Select
                                    value={ importData.category }
                                    onChange={ (value) => setImportData((prev) => ({ ...prev, category: value })) }
                                    placeholder="Select Category"
                                    style={ { width: '100%' } }
                                >
                                    { categories.map((category) => (
                                        <Select.Option key={ category._id } value={ category._id }>
                                            { category.categoryName }
                                        </Select.Option>
                                    )) }
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={ 16 }>
                        <Col span={ 12 }>
                            <Form.Item label="Region" style={ { marginBottom: 16 } }>
                                <Select
                                    placeholder="Select Region"
                                    value={ importData.region }
                                    onChange={ (value) => setImportData((prev) => ({ ...prev, region: value })) }
                                    options={ regionOptions }
                                    style={ { width: '100%' } }
                                />
                            </Form.Item>
                        </Col>

                        <Col span={ 12 }>
                            <Form.Item label="CSV Upload" style={ { marginBottom: 16 } }>
                                <Dragger
                                    { ...uploadProps }
                                    className="csv-uploader"
                                    key={ importModalVisible.toString() }
                                    style={ { width: '100%' } }
                                >
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">
                                        Click or drag CSV file to this area to upload
                                    </p>
                                    <p className="ant-upload-hint">Support for single CSV file upload</p>
                                </Dragger>
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            </Modal>


            {/* //Filter Modal */ }
            <Modal
                title="Outreach Filter"
                open={ filterModal }
                onCancel={ () => { setfilterModal(false) } }
                footer={ null }
                width={ 600 }
                destroyOnClose
            >
                <Divider />
                <Form form={ form } layout="vertical"
                //    onFinish={setApiData}
                >
                    {/* Country Dropdown */ }
                    <Form.Item
                        label="Country"
                        name="country"
                    // rules={[{ required: true, message: "Please select a country!" }]}
                    >
                        <Select
                            placeholder="Select Country"
                            showSearch
                            allowClear
                            onSelect={ (value) => setFormData({ ...formData, country: value }) } // ✅ Fixed onSelect
                            filterOption={ (input, option) =>
                                option?.children.toLowerCase().includes(input.toLowerCase())
                            } // ✅ Enables search filtering
                        >
                            { country?.map((item) => (
                                <Option key={ item.id || item.name } value={ item.name } style={ { textTransform: "capitalize" } }>
                                    { item.name }
                                </Option>
                            )) }
                        </Select>
                    </Form.Item>

                    {/* Status Dropdown */ }
                    {/* <Form.Item
                        label="Status"
                        name="status"
                        rules={[{ required: true, message: "Please select a status!" }]}
                    >
                        <Select placeholder="Select Status">
                            {dropdownData?.statuses.map((item) => (
                                <Option key={item.id} value={item.name}>
                                    {item.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item> */}

                    {/* Region Dropdown */ }
                    <Form.Item
                        label="Region"
                        name="region"
                    // rules={[{ required: true, message: "Please select a region!" }]}
                    >
                        <Select
                            value={ formData.region }
                            onChange={ (value) => setFormData({ ...formData, region: value }) }
                            placeholder="Region"
                            // className="form-input"
                            options={ regionOptions }
                        />
                    </Form.Item>

                    {/* Campaigns Dropdown */ }
                    <Form.Item
                        label="Campaigns"
                        name="campaign"
                    // rules={[{ required: true, message: "Please select a campaign!" }]}
                    >
                        <Select
                            // value={formData.campaign}
                            onChange={ (value) => setFormData({ ...formData, campaign: value }) }
                            placeholder="Campaign"
                        // className="form-input"
                        >
                            { campaigns.map(campaign => (
                                <Select.Option key={ campaign._id } value={ campaign._id }>
                                    { campaign.campaignName }
                                </Select.Option>
                            )) }
                        </Select>
                    </Form.Item>

                    {/* Category Dropdown */ }
                    <Form.Item
                        label="Category"
                        name="category"
                    // rules={[{ required: true, message: "Please select a category!" }]}
                    >
                        <Select
                            // value={formData.category}
                            onChange={ (value) => setFormData({ ...formData, category: value }) }
                            placeholder="Category"
                        // className="form-input"
                        >
                            { categories.map(category => (
                                <Select.Option key={ category._id } value={ category._id }>
                                    { category.categoryName }
                                </Select.Option>
                            )) }
                        </Select>
                    </Form.Item>

                    {/* Assign To Dropdown */ }
                    <Form.Item
                        label="Assign To"
                        name="assignTo"
                        onChange={ (value) => setFormData({ ...formData, assignTo: value?._id }) }

                    // rules={[{ required: true, message: "Please assign a user!" }]}
                    >
                        <Select placeholder="Assign To">
                            { UserData?.map((item) => (
                                <Option key={ item._id } value={ item._id }>
                                    { item.name }
                                </Option>
                            )) }
                        </Select>
                    </Form.Item>

                    <Divider />

                    {/* Modal Footer (Buttons) */ }
                    <div style={ { textAlign: "right" } }>
                        <Button
                        className='text-btn'
                            onClick={ () => { setfilterModal(false) } }
                            style={ { marginRight: 10 } }>
                            Cancel
                        </Button>
                        <Button type="primary" onClick={ handleFilterSubmit } htmlType="submit" loading={ loading }>
                            Save
                        </Button>
                    </div>
                </Form>
            </Modal>

        </div>
    );
};

export default OutReachList;