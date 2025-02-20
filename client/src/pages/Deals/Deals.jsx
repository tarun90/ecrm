import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Modal, Form, Input, Select, DatePicker, InputNumber, message, Popconfirm, Upload, Divider, Col, Row, Drawer } from 'antd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getCompaniesNames } from '../Company/APIServices';

import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  DollarOutlined,
  TeamOutlined,
  SettingOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { dealService, contactService } from '../../services/api';
import styles from './Deals.module.css';
import './dashboard.css'
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
// import LogoIcon from '../assets/Icons/LogoIcon';
// import HeaderLogo from '../assets/Icons/headerlogo';


const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { Dragger } = Upload;
const { Search } = Input;

const stages = [
  'New Leads',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

function Deals() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [contactsList, setContactsList] = useState([]);
  const [collapsed, setCollapsed] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importType, setImportType] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchDeals();
    fetchContacts();
    fetchContactList();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      let data = await getCompaniesNames();
      setCompanies(data);
    }
    catch (error) {
      console.log(error);
    }
  }

  const logoutFunctionality = async () => {
    logout();
    navigate('login')
  }

  const fetchDeals = async (searchTerm = '') => {
    try {
      const dealsData = await dealService.getAllDeals(searchTerm);
      setDeals(dealsData);
      setFilteredDeals(dealsData);
    } catch (error) {
      message.error('Failed to fetch deals');
      console.error('Error fetching deals:', error);
    }
  };

  const handleSearch = async (value) => {
    setSearchQuery(value);
    try {
      await fetchDeals(value);
    } catch (error) {
      message.error('Error searching deals');
      console.error('Error searching deals:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const contactsData = await contactService.getAllContacts();
      setContacts(contactsData);
    } catch (error) {
      message.error('Failed to fetch contacts');
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchContactList = async () => {
    try {
      const contactsData = await contactService.getContactList();
      setContactsList(contactsData);
    } catch (error) {
      // message.error('Failed to fetch contacts');
      console.error('Error fetching contacts:', error);
    }
  };


  const handleImport = async (file, type) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (type === 'deals') {
        await dealService.importDeals(formData);
        setIsImportModalVisible(false);

        await fetchDeals();
        message.success('Deals imported successfully');
      } else {
        await contactService.importContacts(formData);
        await fetchContacts();
        message.success('Contacts imported successfully');
      }
      return false;
    } catch (error) {
      message.error(`Failed to import ${type}`);
      console.error(`Error importing ${type}:`, error);
      return false;
    }
  };

  const showImportModal = (type) => {
    setImportType(type);
    setIsImportModalVisible(true);
  };

  const reorderDeals = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    try {
      const draggedDeal = deals.find(deal => deal._id === draggableId);

      if (!draggedDeal) return;

      const updatedDeal = {
        ...draggedDeal,
        stage: destination.droppableId
      };

      // Create new arrays for both deals and filteredDeals
      const newDeals = Array.from(deals);
      const newFilteredDeals = Array.from(filteredDeals);

      // Find and update the deal in both arrays
      const dealIndex = newDeals.findIndex(deal => deal._id === draggableId);
      const filteredDealIndex = newFilteredDeals.findIndex(deal => deal._id === draggableId);

      if (dealIndex !== -1) {
        newDeals[dealIndex] = updatedDeal;
      }

      if (filteredDealIndex !== -1) {
        newFilteredDeals[filteredDealIndex] = updatedDeal;
      }

      // Update both states optimistically
      setDeals(newDeals);
      setFilteredDeals(newFilteredDeals);

      // Update backend
      await dealService.updateDealStage(draggableId, destination.droppableId);
      message.success('Deal stage updated successfully');
    } catch (error) {
      // Revert both states on error
      const originalDeals = await dealService.getAllDeals(searchQuery);
      setDeals(originalDeals);
      setFilteredDeals(originalDeals);
      message.error('Failed to update deal stage');
      console.error('Error updating deal stage:', error);
    }
  };

  const handleCreateDeal = async (values) => {
    try {
      setLoading(true);
      // console.log(user)
      const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null


      const newDeal = await dealService.createDeal({
        ...values,
        closeDate: values.closeDate.toISOString(),
        owner: userData?.id
      });

      setDeals([...deals, newDeal]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Deal created successfully');
      await fetchDeals();
    } catch (error) {
      message.error('Failed to create deal');
      console.error('Error creating deal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDeal = async (values) => {
    try {
      setLoading(true);
      const updatedDeal = await dealService.updateDeal(selectedDeal._id, {
        ...values,
        closeDate: values.closeDate.toISOString(),
      });

      setDeals(deals.map(deal =>
        deal._id === selectedDeal._id ? updatedDeal : deal
      ));
      setIsEditModalVisible(false);
      setSelectedDeal(null);
      editForm.resetFields();
      message.success('Deal updated successfully');
      await fetchDeals();

    } catch (error) {
      message.error('Failed to update deal');
      console.error('Error updating deal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeal = async (dealId) => {
    try {
      await dealService.deleteDeal(dealId);
      setDeals(deals.filter(deal => deal._id !== dealId));
      message.success('Deal deleted successfully');
      await fetchDeals();

    } catch (error) {
      message.error('Failed to delete deal');
      console.error('Error deleting deal:', error);
    }
  };

  const openEditModal = (deal) => {
    setSelectedDeal(deal);
    console.log(deal, "deal")
    editForm.setFieldsValue({
      ...deal,
      contact: deal?.contact?._id,
      company: deal?.company?._id,
      closeDate: dayjs(deal.closeDate),
    });
    setIsEditModalVisible(true);
  };

  const openViewModal = (deal) => {
    setSelectedDeal(deal);
    handleView(deal._id);
    // setIsViewModalVisible(true);
  };

  const userMenu = (
    <Menu className='logout'>
      {/* <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item> */}
      <Menu.Item key="logout" icon={ <LogoutOutlined /> } onClick={ logoutFunctionality }>
        Logout
      </Menu.Item>
    </Menu>
  );
  const handleView = (id) => {
    navigate(`/deals/view/${id}`);
  };
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.csv',
    beforeUpload: (file) => handleImport(file, importType),
    showUploadList: false,
  };

  const getDealsInStage = (stage) => filteredDeals?.filter((deal) => deal?.stage === stage);

  return (
    // <MainLayout>
    // <Layout className={ styles.layout }>
    // <Sider collapsible collapsed={ collapsed } onCollapse={ setCollapsed } className='Sidebar'>
    //   <div className={ styles.logo }>
    //     <HeaderLogo />
    //   </div>
    //   <Menu theme="dark" mode="inline" defaultSelectedKeys={ ['1'] }>
    //     <Menu.Item key="1" icon={ <HomeOutlined /> }>
    //       Dashboard
    //     </Menu.Item>
    //     <Menu.Item key="2" icon={ <DollarOutlined /> }>
    //       Deals
    //     </Menu.Item>
    //     <Menu.Item key="3" icon={ <TeamOutlined /> }>
    //       Contacts
    //     </Menu.Item>
    //     {/* <Menu.Item key="4" icon={<SettingOutlined />}>
    //       Settings
    //     </Menu.Item> */}
    //   </Menu>
    // </Sider>
    <Layout className='main-content-wrapper'>

      <Header className="content-header">
        <div className={ styles.headerContent }>
          <div className={ styles.headerActions }>
            <div className='heading'>
              <h1>Deals</h1>
            </div>
            <Button
              type="primary"
              icon={ <PlusOutlined /> }
              onClick={ () => setIsModalVisible(true) }
              style={ { marginLeft: 'auto' } }
            >
              {/* karan final save */ }
              Create Deal
            </Button>
            <Dropdown
              menu={ {
                items: [
                  {
                    key: 'deals',
                    label: 'Import Deals',
                    icon: <UploadOutlined />,
                    onClick: () => showImportModal('deals')
                  },
                  // {
                  //   key: 'contacts',
                  //   label: 'Import Contacts',
                  //   icon: <UploadOutlined />,
                  //   onClick: () => showImportModal('contacts')
                  // }
                ]
              } }
            >
              <Button icon={ <UploadOutlined /> } className="text-btn ">Import</Button>
            </Dropdown>
          </div>

        </div>
      </Header>
      <div className='global-search'>
        <Search
          placeholder="Search deals by name or company..."
          allowClear
          onChange={ (e) => handleSearch(e.target.value) }
          className={ styles.searchBar }
        />
      </div>

      <Content className="content-warpper">
        <DragDropContext onDragEnd={ onDragEnd }>
          <div className={ styles.kanbanBoard }>
            { stages.map((stage) => {
              const stageDeals = getDealsInStage(stage);
              return (
                <div key={ stage } className={ styles.kanbanColumn }>
                  <h3>
                    { stage }
                    <span className={ styles.columnCount }>{ stageDeals.length }</span>
                  </h3>
                  <Droppable droppableId={ stage }>
                    { (provided, snapshot) => (
                      <div
                        ref={ provided.innerRef }
                        { ...provided.droppableProps }
                        className={ `${styles.dealList} ${snapshot.isDraggingOver ? styles.isDraggingOver : 'scroll'}` }
                      >
                        { stageDeals.map((deal, index) => (
                          <Draggable
                            key={ deal._id }
                            draggableId={ String(deal._id) }
                            index={ index }
                          >
                            { (provided, snapshot) => (
                              <div
                                ref={ provided.innerRef }
                                { ...provided.draggableProps }
                                { ...provided.dragHandleProps }
                                className={ `${styles.dealCard} ${snapshot.isDragging ? styles.isDragging : ''}` }
                                onClick={ () => openViewModal(deal) }
                              >
                                <div className={ styles.dealHeader }>
                                  <h4>{ deal.name }</h4>
                                  <div className={ styles.dealActions }>
                                    {/* <Button
                                      type="text"
                                      icon={ <EyeOutlined /> }
                                      onClick={ (e) => {
                                        e.stopPropagation();
                                        openViewModal(deal);
                                      } }
                                    /> */}
                                    <Button
                                      type="text"
                                      icon={ <EditOutlined /> }
                                      onClick={ (e) => {
                                        e.stopPropagation();
                                        openEditModal(deal);
                                      } }
                                    />
                                    <Popconfirm
                                      title="Delete deal"
                                      description="Are you sure you want to delete this deal?"
                                      onConfirm={ (e) => {
                                        e.stopPropagation();
                                        handleDeleteDeal(deal._id);
                                      } }
                                      okText="Yes"
                                      cancelText="No"
                                    >
                                      <Button
                                        type="text"
                                        danger
                                        icon={ <DeleteOutlined /> }
                                        onClick={ (e) => e.stopPropagation() }
                                      />
                                    </Popconfirm>
                                  </div>
                                </div>
                                <p className={ styles.dealCompany }>{ deal.company?.companyName }</p>
                                <div className={ styles.dealInfo }>
                                  <span className={ `${styles.dealAmount} ${deal.amount < 0 ? styles.negative : ''}` }>
                                    Amount:
                                    ${ deal.amount.toLocaleString() }
                                  </span>
                                  <span>•</span>
                                  <span>
                                    <ClockCircleOutlined /> { new Date(deal.closeDate).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    }).replace(/\//g, '-') }
                                  </span>
                                </div>
                              </div>
                            ) }
                          </Draggable>
                        )) }
                        { provided.placeholder }
                      </div>
                    ) }
                  </Droppable>
                </div>
              );
            }) }
          </div>
        </DragDropContext>
      </Content>

      <Drawer
        title="Create Deal"
        open={ isModalVisible }
        width={ 400 }
        onClose={ () => {
          setIsModalVisible(false);
          form.resetFields();
        } }
        footer={
          <div style={ { textAlign: 'right' } }>
            <Button
              key="cancel"
              className="text-btn"
              onClick={ () => {
                setIsModalVisible(false);
                form.resetFields();
              } }
            >
              Cancel
            </Button>
            <Button
              key="create"
              type="primary"
              onClick={ () => form.submit() }
              loading={ loading }
              style={ { marginLeft: 8 } }
            >
              Create
            </Button>
          </div>
        }
      >

        <Form form={ form } layout="vertical" onFinish={ handleCreateDeal }>
          <Row gutter={ 24 } >
            <Col span={ 24 }>
              <Form.Item
                name="name"
                label="Deal name"
                rules={ [{ required: true, message: "Please enter deal name" }] }
              >
                <Input placeholder="Enter deal name" />
              </Form.Item>

              <Form.Item
                name="stage"
                label="Deal stage"
                initialValue="New Leads"
                rules={ [{ required: true, message: "Please select deal stage" }] }
              >
                <Select placeholder="Select stage">
                  { stages.map((stage) => (
                    <Option key={ stage } value={ stage }>
                      { stage }
                    </Option>
                  )) }
                </Select>
              </Form.Item>

              <Form.Item
                name="amount"
                label="Amount"
                rules={ [{ required: true, message: "Please enter amount" }] }
              >
                <InputNumber
                  style={ { width: "100%" } }
                  formatter={ (value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={ (value) => value.replace(/\$\s?|(,*)/g, "") }
                  placeholder="0.00"
                />
              </Form.Item>

              <Form.Item
                name="closeDate"
                label="Close date"
                rules={ [{ required: true, message: "Please select close date" }] }
              >
                <DatePicker style={ { width: "100%" } } format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
            <Col span={ 24 }>
              <Form.Item
                name="type"
                label="Deal type"
                rules={ [{ required: true, message: "Please select deal type" }] }
              >
                <Select placeholder="Select type">
                  <Option value="new">New Business</Option>
                  <Option value="existing">Existing Business</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="contact"
                label="Contact"
                rules={ [{ required: true, message: "Please select contact" }] }
              >
                <Select
                  showSearch
                  placeholder="Search contacts"
                  filterOption={ (input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={ (value) => {
                    const selectedContact = contactsList.find(
                      (contact) => contact._id === value
                    );
                    if (selectedContact) {
                      form.setFieldsValue({
                        company: selectedContact.company,
                      });
                    }
                  } }
                >
                  { contactsList.map((contact) => (
                    <Option key={ contact._id } value={ contact._id }>
                      { contact.firstName + " " + contact.lastName }
                    </Option>
                  )) }
                </Select>
              </Form.Item>

              <Form.Item
                name="company"
                label="Company"
                rules={ [{ required: true, message: "Please enter company name" }] }
              >
                <Select
                  showSearch
                  disabled
                  placeholder="Search Company"
                  filterOption={ (input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  { companies.map((company) => (
                    <Option key={ company._id } value={ company._id }>
                      { company?.companyName }
                    </Option>
                  )) }
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>



      {/* Edit Deal Modal */ }
      <Drawer
        title="Edit Deal"
        open={ isEditModalVisible }
        width={ 400 }
        onClose={ () => {
          setIsEditModalVisible(false);
          setSelectedDeal(null);
          editForm.resetFields();
        } }
        footer={
          <div style={ { textAlign: 'right' } }>
            <Button
              key="cancel"
              className="text-btn"
              onClick={ () => {
                setIsEditModalVisible(false);
                setSelectedDeal(null);
                editForm.resetFields();
              } }
            >
              Cancel
            </Button>
            <Button
              key="update"
              type="primary"
              onClick={ () => editForm.submit() }
              loading={ loading }
              style={ { marginLeft: 8 } }
            >
              Update
            </Button>
          </div>
        }
      >
        <Divider />
        <Form form={ editForm } layout="vertical" onFinish={ handleEditDeal }>
          <Row gutter={ 24 } >
            <Col span={ 24 }>
              <Form.Item
                name="name"
                label="Deal name"
                rules={ [{ required: true, message: "Please enter deal name" }] }
              >
                <Input placeholder="Enter deal name" />
              </Form.Item>

              <Form.Item
                name="stage"
                label="Deal stage"
                rules={ [{ required: true, message: "Please select deal stage" }] }
              >
                <Select placeholder="Select stage">
                  { stages.map((stage) => (
                    <Option key={ stage } value={ stage }>
                      { stage }
                    </Option>
                  )) }
                </Select>
              </Form.Item>

              <Form.Item
                name="amount"
                label="Amount"
                rules={ [{ required: true, message: "Please enter amount" }] }
              >
                <InputNumber
                  style={ { width: "100%" } }
                  formatter={ (value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={ (value) => value.replace(/\$\s?|(,*)/g, "") }
                  placeholder="0.00"
                />
              </Form.Item>

              <Form.Item
                name="closeDate"
                label="Close date"
                rules={ [{ required: true, message: "Please select close date" }] }
              >
                <DatePicker style={ { width: "100%" } } format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
            <Col span={ 24 }>
              <Form.Item
                name="type"
                label="Deal type"
                rules={ [{ required: true, message: "Please select deal type" }] }
              >
                <Select placeholder="Select type">
                  <Option value="new">New Business</Option>
                  <Option value="existing">Existing Business</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="contact"
                label="Contact"
                rules={ [{ required: true, message: "Please select contact" }] }
              >
                <Select
                  showSearch
                  placeholder="Search contacts"
                  filterOption={ (input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={ (value) => {
                    const selectedContact = contactsList.find(
                      (contact) => contact._id === value
                    );
                    if (selectedContact) {
                      editForm.setFieldsValue({
                        company: selectedContact.company,
                      });
                    }
                  } }
                >
                  { contactsList.map((contact) => (
                    <Option key={ contact._id } value={ contact._id }>
                      { contact.firstName + " " + contact.lastName }
                    </Option>
                  )) }
                </Select>
              </Form.Item>

              <Form.Item
                name="company"
                label="Company"
                rules={ [{ required: true, message: "Please enter company name" }] }
              >
                <Select
                  showSearch
                  disabled
                  placeholder="Search Company"
                  filterOption={ (input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  { companies.map((company) => (
                    <Option key={ company._id } value={ company._id }>
                      { company?.companyName }
                    </Option>
                  )) }
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>



      {/* View Deal Modal */ }
      <Drawer
        title="View Deal"
        open={ isViewModalVisible }
        onClose={ () => {
          setIsViewModalVisible(false);
          setSelectedDeal(null);
        } }
        width={ 600 }
        footer={
          <div style={ { textAlign: 'right' } }>
            <Button
              className="text-btn"
              key="close"
              onClick={ () => {
                setIsViewModalVisible(false);
                setSelectedDeal(null);
              } }
            >
              Cancel
            </Button>
            <Button
              key="edit"
              type="primary"
              onClick={ () => {
                setIsViewModalVisible(false);
                openEditModal(selectedDeal);
              } }
              style={ { marginLeft: 8 } }
            >
              Edit Deal
            </Button>
          </div>
        }
      >
        <Divider />
        { console.log(selectedDeal, "selectedDeal") }
        { selectedDeal && (
          <div className={ styles.viewDealContent }>
            <div className={ styles.viewDealItem }>
              <strong>Deal Name:</strong>
              <span>{ selectedDeal?.name }</span>
            </div>
            <div className={ styles.viewDealItem }>
              <strong>Company:</strong>
              <span>{ selectedDeal?.company?.companyName }</span>
            </div>
            <div className={ styles.viewDealItem }>
              <strong>Stage:</strong>
              <span>{ selectedDeal?.stage }</span>
            </div>
            <div className={ styles.viewDealItem }>
              <strong>Amount:</strong>
              <span>${ selectedDeal?.amount.toLocaleString() }</span>
            </div>
            <div className={ styles.viewDealItem }>
              <strong>Close Date:</strong>
              <span>{ new Date(selectedDeal?.closeDate).toLocaleDateString() }</span>
            </div>
            <div className={ styles.viewDealItem }>
              <strong>Deal Type:</strong>
              <span>{ selectedDeal?.type === "new" ? "New Business" : "Existing Business" }</span>
            </div>
            { selectedDeal.notes && (
              <div className={ styles.viewDealItem }>
                <strong>Notes:</strong>
                <span>{ selectedDeal?.notes }</span>
              </div>
            ) }
          </div>
        ) }
      </Drawer>


      {/* Import Modal */ }
      <Modal

        title={ `Import ${importType === 'deals' ? 'Deals' : 'Contacts'}` }
        open={ isImportModalVisible }
        onCancel={ () => setIsImportModalVisible(false) }
        footer={ null }
      >
        <div className={ styles.importInstructions }>
          <h4>Instructions:</h4>
          <p>1. Prepare your CSV file with the following columns:</p>
          { importType === 'deals' ? (
            <ul>
              <li>name (required)</li>
              <li>amount (required)</li>
              <li>stage</li>
              <li>company (required)</li>
              <li>closeDate (YYYY-MM-DD format)</li>
              <li>type (new/existing)</li>
              <li>contact (contact ID)</li>
            </ul>
          ) : (
            <ul>
              <li>name (required)</li>
              <li>email (required)</li>
              <li>phone</li>
              <li>company</li>
              <li>industry</li>
              <li>region</li>
              <li>leadSource</li>
              <li>serviceCategory</li>
              <li>tags (comma-separated)</li>
            </ul>
          ) }
          <p>2. Make sure your CSV file uses comma (,) as the delimiter</p>
          <p>3. Upload your file using the area below</p>
        </div>
        <Dragger { ...uploadProps } className={ styles.importUploader }>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for single CSV file upload only
          </p>
        </Dragger>
      </Modal>
    </Layout>
  );
}

export default Deals;