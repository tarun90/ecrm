import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Modal, Form, Input, Select, DatePicker, InputNumber, message, Popconfirm, Upload } from 'antd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
import { useAuth } from '../contexts/AuthContext';
import { dealService, contactService } from '../services/api';
import styles from './Dashboard.module.css';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';


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

function Dashboard() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importType, setImportType] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchDeals();
    fetchContacts();
  }, []);

  const logoutFunctionality = async ()=>{
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
      const newDeal = await dealService.createDeal({
        ...values,
        closeDate: values.closeDate.toISOString(),
        owner: user.id
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
    editForm.setFieldsValue({
      ...deal,
      closeDate: dayjs(deal.closeDate),
    });
    setIsEditModalVisible(true);
  };

  const openViewModal = (deal) => {
    setSelectedDeal(deal);
    setIsViewModalVisible(true);
  };

  const userMenu = (
    <Menu>
      {/* <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item> */}
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logoutFunctionality}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.csv',
    beforeUpload: (file) => handleImport(file, importType),
    showUploadList: false,
  };

  const getDealsInStage = (stage) => filteredDeals.filter((deal) => deal.stage === stage);

  return (
    <Layout className={styles.layout}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className={styles.logo}>DM</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="2" icon={<DollarOutlined />}>
            Deals
          </Menu.Item>
          <Menu.Item key="3" icon={<TeamOutlined />}>
            Contacts
          </Menu.Item>
          <Menu.Item key="4" icon={<SettingOutlined />}>
            Settings
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerActions}>
              <Search
                placeholder="Search deals by name or company..."
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                className={styles.searchBar}
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
                style={{marginLeft:'auto'}}
              >
                {/* karan final save */}
                Create Deal
              </Button>
              <Dropdown
                menu={{
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
                }}
              >
                <Button icon={<UploadOutlined />}>Import</Button>
              </Dropdown>
            </div>
            <Dropdown overlay={userMenu} trigger={['click']}>
              <Avatar icon={<UserOutlined />} />
            </Dropdown>
          </div>
        </Header>
        <Content className={styles.content}>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className={styles.kanbanBoard}>
              {stages.map((stage) => {
                const stageDeals = getDealsInStage(stage);
                return (
                  <div key={stage} className={styles.kanbanColumn}>
                    <h3>
                      {stage}
                      <span className={styles.columnCount}>{stageDeals.length}</span>
                    </h3>
                    <Droppable droppableId={stage}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`${styles.dealList} ${snapshot.isDraggingOver ? styles.isDraggingOver : ''}`}
                        >
                          {stageDeals.map((deal, index) => (
                            <Draggable
                              key={deal._id}
                              draggableId={String(deal._id)}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`${styles.dealCard} ${snapshot.isDragging ? styles.isDragging : ''}`}
                                  onClick={() => openViewModal(deal)}
                                >
                                  <div className={styles.dealHeader}>
                                    <h4>{deal.name}</h4>
                                    <div className={styles.dealActions}>
                                      <Button
                                        type="text"
                                        icon={<EyeOutlined />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openViewModal(deal);
                                        }}
                                      />
                                      <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditModal(deal);
                                        }}
                                      />
                                      <Popconfirm
                                        title="Delete deal"
                                        description="Are you sure you want to delete this deal?"
                                        onConfirm={(e) => {
                                          e.stopPropagation();
                                          handleDeleteDeal(deal._id);
                                        }}
                                        okText="Yes"
                                        cancelText="No"
                                      >
                                        <Button
                                          type="text"
                                          danger
                                          icon={<DeleteOutlined />}
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </Popconfirm>
                                    </div>
                                  </div>
                                  <p className={styles.dealCompany}>{deal.company}</p>
                                  <div className={styles.dealInfo}>
                                    <span className={`${styles.dealAmount} ${deal.amount < 0 ? styles.negative : ''}`}>
                                      ${deal.amount.toLocaleString()}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      <ClockCircleOutlined /> {new Date(deal.closeDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </Content>

        {/* Create Deal Modal */}
        <Modal
          title="Create Deal"
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          footer={[
            <Button 
              key="cancel" 
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>,
            <Button 
              key="create" 
              type="primary" 
              onClick={() => form.submit()}
              loading={loading}
            >
              Create
            </Button>
          ]}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateDeal}
          >
            <Form.Item
              name="name"
              label="Deal name"
              rules={[{ required: true, message: 'Please enter deal name' }]}
            >
              <Input placeholder="Enter deal name" />
            </Form.Item>

            {/* <Form.Item
              name="pipeline"
              label="Pipeline"
              initialValue="deals"
              rules={[{ required: true, message: 'Please select pipeline' }]}
            >
              <Select placeholder="Select pipeline">
                <Option value="deals">Deals pipeline</Option>
              </Select>
            </Form.Item> */}

            <Form.Item
              name="stage"
              label="Deal stage"
              initialValue="New Leads"
              rules={[{ required: true, message: 'Please select deal stage' }]}
            >
              <Select placeholder="Select stage">
                {stages.map(stage => (
                  <Option key={stage} value={stage}>{stage}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: 'Please enter amount' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              name="closeDate"
              label="Close date"
              rules={[{ required: true, message: 'Please select close date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="type"
              label="Deal type"
              rules={[{ required: true, message: 'Please select deal type' }]}
            >
              <Select placeholder="Select type">
                <Option value="new">New Business</Option>
                <Option value="existing">Existing Business</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="contact"
              label="Contact"
              rules={[{ required: true, message: 'Please select contact' }]}
            >
              {/* <Select
                showSearch
                placeholder="Search contacts"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {contacts.map(contact => (
                  <Option key={contact._id} value={contact._id}>
                    {contact.name}
                  </Option>
                ))}
              </Select> */}
              <Input placeholder="Enter Contact" />
            </Form.Item>

            <Form.Item
              name="company"
              label="Company"
              rules={[{ required: true, message: 'Please enter company name' }]}
            >
              <Input placeholder="Enter company name" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Edit Deal Modal */}
        <Modal
          title="Edit Deal"
          open={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            setSelectedDeal(null);
            editForm.resetFields();
          }}
          footer={[
            <Button 
              key="cancel" 
              onClick={() => {
                setIsEditModalVisible(false);
                setSelectedDeal(null);
                editForm.resetFields();
              }}
            >
              Cancel
            </Button>,
            <Button 
              key="update" 
              type="primary" 
              onClick={() => editForm.submit()}
              loading={loading}
            >
              Update
            </Button>
          ]}
          width={600}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditDeal}
          >
            <Form.Item
              name="name"
              label="Deal name"
              rules={[{ required: true, message: 'Please enter deal name' }]}
            >
              <Input placeholder="Enter deal name" />
            </Form.Item>

            <Form.Item
              name="stage"
              label="Deal stage"
              rules={[{ required: true, message: 'Please select deal stage' }]}
            >
              <Select placeholder="Select stage">
                {stages.map(stage => (
                  <Option key={stage} value={stage}>{stage}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: 'Please enter amount' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              name="closeDate"
              label="Close date"
              rules={[{ required: true, message: 'Please select close date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="type"
              label="Deal type"
              rules={[{ required: true, message: 'Please select deal type' }]}
            >
              <Select placeholder="Select type">
                <Option value="new">New Business</Option>
                <Option value="existing">Existing Business</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="contact"
              label="Contact"
              rules={[{ required: true, message: 'Please select contact' }]}
            >
              {/* <Select
                showSearch
                placeholder="Search contacts"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {contacts.map(contact => (
                  <Option key={contact._id} value={contact._id}>
                    {contact.name}
                  </Option>
                ))}
              </Select> */}
               <Input placeholder="Enter Contact" />
            </Form.Item>

            <Form.Item
              name="company"
              label="Company"
              rules={[{ required: true, message: 'Please enter company name' }]}
            >
              <Input placeholder="Enter company name" />
            </Form.Item>
          </Form>
        </Modal>

        {/* View Deal Modal */}
        <Modal
          title="View Deal"
          open={isViewModalVisible}
          onCancel={() => {
            setIsViewModalVisible(false);
            setSelectedDeal(null);
          }}
          footer={[
            <Button 
              key="close" 
              onClick={() => {
                setIsViewModalVisible(false);
                setSelectedDeal(null);
              }}
            >
              Close
            </Button>,
            <Button 
              key="edit" 
              type="primary" 
              onClick={() => {
                setIsViewModalVisible(false);
                openEditModal(selectedDeal);
              }}
            >
              Edit Deal
            </Button>
          ]}
          width={600}
        >
          {selectedDeal && (
            <div className={styles.viewDealContent}>
              <div className={styles.viewDealItem}>
                <strong>Deal Name:</strong>
                <span>{selectedDeal.name}</span>
              </div>
              <div className={styles.viewDealItem}>
                <strong>Company:</strong>
                <span>{selectedDeal.company}</span>
              </div>
              <div className={styles.viewDealItem}>
                <strong>Stage:</strong>
                <span>{selectedDeal.stage}</span>
              </div>
              <div className={styles.viewDealItem}>
                <strong>Amount:</strong>
                <span>${selectedDeal.amount.toLocaleString()}</span>
              </div>
              <div className={styles.viewDealItem}>
                <strong>Close Date:</strong>
                <span>{new Date(selectedDeal.closeDate).toLocaleDateString()}</span>
              </div>
              <div className={styles.viewDealItem}>
                <strong>Deal Type:</strong>
                <span>{selectedDeal.type === 'new' ? 'New Business' : 'Existing Business'}</span>
              </div>
              {selectedDeal.notes && (
                <div className={styles.viewDealItem}>
                  <strong>Notes:</strong>
                  <span>{selectedDeal.notes}</span>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Import Modal */}
        <Modal
          title={`Import ${importType === 'deals' ? 'Deals' : 'Contacts'}`}
          open={isImportModalVisible}
          onCancel={() => setIsImportModalVisible(false)}
          footer={null}
        >
          <div className={styles.importInstructions}>
            <h4>Instructions:</h4>
            <p>1. Prepare your CSV file with the following columns:</p>
            {importType === 'deals' ? (
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
            )}
            <p>2. Make sure your CSV file uses comma (,) as the delimiter</p>
            <p>3. Upload your file using the area below</p>
          </div>
          <Dragger {...uploadProps} className={styles.importUploader}>
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
    </Layout>
  );
}

export default Dashboard;