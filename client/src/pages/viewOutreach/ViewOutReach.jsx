import React, { useEffect, useState } from 'react';
import { Settings, Plus, ArrowLeft, Edit, Mail, Phone, Calendar, MoreHorizontal, Copy, Paperclip  } from 'lucide-react';
import './ViewOutReach.css';
import { Button, Checkbox, DatePicker, Divider, Form, Input, message, Modal, Upload,Card, Empty, List, Popconfirm, Space, Typography, Tooltip } from 'antd';
import { CaretDownOutlined, UploadOutlined,  DeleteOutlined, 
  PlusOutlined, 
    } from '@ant-design/icons';
import axios from 'axios';
import { getOutreachDataById } from '../OutReach/outreachService';
import { useNavigate, useParams } from 'react-router-dom';
import { createNote, getNotesByOutreach, updateNote  } from './noteService';
import moment from 'moment';
const ActionButton = ({ icon, label, onClick }) => {
  return (
    <div className="action-button">
      <button className="icon-button" onClick={onClick}>{icon}</button>
      <span className="button-label">{label}</span>
    </div>
  );
};



const MainContent = ({ form, outReachData,modalOpen, modalOpenForNote,modalClose}) => {
  let userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userDate')) : {}
  const sections = ['Notes'];
  const checkBoxOptions = ["Email", "Phone", "IM", "Linkedin"];
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await getNotesByOutreach(outReachData._id);
      setNotes(fetchedNotes);
    } catch (error) {
      message.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (outReachData._id) {
      fetchNotes();
    }
  }, [outReachData._id]);
  const handleSubmit = async (values) => {
    try {
      if (editingNote) {
        await updateNote(editingNote._id, values);
        message.success('Note updated successfully!');
      } else {
        await createNote(outReachData._id, values);
        message.success('Note created successfully!');
      }
      fetchNotes();
      handleModalClose();
    } catch (error) {
      message.error('Failed to ' + (editingNote ? 'update' : 'create') + ' note: ' + (error.message || 'Unknown error'));
    }
  };
  const handleEdit = (note) => {
    setEditingNote(note);
    const initialValues = {
      options: note.contactMethod,
      message: note.message,
      reminder: moment(note.reminderDate)
    };

    // Only add attachment if it exists
    if (note.attachment) {
      initialValues.attachment = [{
        uid: '-1',
        name: note.attachment.filename,
        status: 'done',
        url: `${import.meta.env.VITE_TM_API_URL}/${note.attachment.path}`,
        response: note.attachment
      }];
    }

    form.setFieldsValue(initialValues);
    modalOpenForNote();
  };
  const handleModalClose = () => {
    setEditingNote(null);
    form.resetFields();
    modalClose();
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  return (
    <div className="main-content">
      { sections.map((section) => (
             <div key={ section } className="content-section">
               <div className="section-header">
                 <h2>{ section }</h2>
                 <div className="header-actions">
                  {/* {userData?.department?.name?.toLowerCase() == 'outreach team' && */}
                 <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={modalOpenForNote}
                >
                  Add
                </Button>
{/* } */}
                   {/* <Settings /> */}
                 </div>
               </div>
               {/* <div className="section-content">
                 <p>No associated objects of this type exist or you don't have permission to view them.</p>
               </div> */}
               <div className="section-content">
                 <table>
                                    <thead>
                                        <tr>
                                           
                                            <th>Contact Method</th>
                                            <th>Message</th>
                                            <th>Reminder Date</th>
                                            <th>Attachment</th>
                                            <th>Created At</th>
                                            {/* {userData?.department?.name?.toLowerCase() == 'outreach team' && */}
                                             <th>Actions</th>
                                              {/* } */}
                                           
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notes.map(item => (
                                            <tr key={item?._id}>
                                              
                                                <td>{item?.contactMethod?.toString()}</td>
                                                <td>{item?.message}</td>
                                                <td>{moment(item?.reminderDate).format('DD-MM-YYYY HH:mm')}</td>
                                                <td>{item?.attachment ? <a target="_blank" href={`${import.meta.env.VITE_TM_API_URL}/${item?.attachment.path}`}> {item?.attachment?.filename} </a>: "-"}</td>
                                                <td>{moment(item?.createdAt).format('DD-MM-YYYY HH:mm')}</td>
                                                {/* {userData?.department?.name?.toLowerCase() == 'outreach team' &&  */}
                                                <td>
                                                <Button 
                        type="link" 
                        icon={<Edit />} 
                        onClick={() => handleEdit(item)}
                      /></td> 
                                                {/* } */}
                                                
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
               </div>
             </div>
           )) }
       <Modal
        title={`${editingNote ? 'Edit' : 'Add'} Note - ${outReachData.name}`}
        open={modalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <Divider />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ borderBottom: "1px solid #ddd", paddingBottom: "15px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Contacted Through</h3>
            <Form.Item name="options">
              <Checkbox.Group options={checkBoxOptions} />
            </Form.Item>
          </div>

          <div>
            <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Notes</h3>
            <Form.Item
              label="Message"
              name="message"
              rules={[{ required: true, message: "Please enter a message!" }]}
            >
              <Input.TextArea placeholder="Enter your message..." rows={3} />
            </Form.Item>

            <Form.Item 
  label="Attachment" 
  name="attachment"
  valuePropName="fileList"
  getValueFromEvent={normFile}
>
  <Upload 
    beforeUpload={() => false}
    maxCount={1}
    listType="text"
  >
    <Button icon={<UploadOutlined />}>Upload Attachment</Button>
  </Upload>
</Form.Item>

            <Form.Item
              label="Add Reminder"
              name="reminder"
              rules={[{ required: true, message: "Please enter a reminder!" }]}
            >
              <DatePicker
                showTime={{ format: 'HH:mm:ss' }}
                className="w-full"
                placeholder="Select date"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>
          <Divider />

          <div style={{ textAlign: "right", marginTop: "20px" }}>
            <Button style={{ marginRight: 10 }} onClick={handleModalClose}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingNote ? 'Update' : 'Save'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ outReachData,modalOpenForNote }) => {
  //   const [outReachData,setOutReachData]=useState({})
  // const paramsId=useParams()
  const navigate = useNavigate();
  let userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userDate')) : {}


  // const fetchOutReachDataById=async()=>{
  //   try {

  //     const data=await getOutreachDataById(paramsId.id)
  //     setOutReachData(data)

  //   } catch (error) {
  //     console.log(error);

  //   }
  // }
  const actions = [
    { icon: <Edit />, label: 'Note',  onClick:()=>{
      modalOpenForNote()
    }},
    {
      icon: <Mail />, label: 'Email',
      onClick: () => {
        window.location.href = `mailto:${outReachData.email}`;
      }
    },
    {
      icon: <Phone />, label: 'Call',
      onClick: () => window.location.href = `tel:${outReachData.phone}`
    },

    // { icon: <Edit />, label: 'Task' },
    // { icon: <Calendar />, label: 'Meeting' },
    // { icon: <MoreHorizontal />, label: 'More' }
  ];

  const actions2 = [
   
    {
      icon: <Mail />, label: 'Email',
      onClick: () => {
        window.location.href = `mailto:${outReachData.email}`;
      }
    },
    {
      icon: <Phone />, label: 'Call',
      onClick: () => window.location.href = `tel:${outReachData.phone}`
    },

    // { icon: <Edit />, label: 'Task' },
    // { icon: <Calendar />, label: 'Meeting' },
    // { icon: <MoreHorizontal />, label: 'More' }
  ];

  // useEffect(()=>{
  //   fetchOutReachDataById()
  // },[])
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <ArrowLeft className="back-icon" onClick={() => navigate(-1)} />
        <span>Outreach details</span>
        {/* <Button icon={ <CaretDownOutlined /> }>Actions </Button> */}
      </div>

      <div className="contact-card scroll">
        <div className="contact-info">
          <div className="avatar">{outReachData?.name?.at(0)}</div>
          <div className="contact-details">
            <h2>{outReachData.name}</h2>
            {/* <h3>Blanden</h3> */}
            <Button className="email" onClick={() => {
              navigator.clipboard.writeText(outReachData.email).then(() => {
                message.success('Mail copied!')
              })

            }}>
              <a >{outReachData.email}</a>
              <Copy />
            </Button>

          </div>
        </div>

        <div className="action-buttons">
          {userData?.department?.name?.toLowerCase == 'outreach team' ? <>
          {actions.map((action, index) => (
            <ActionButton key={index} icon={action.icon} label={action.label}
              onClick={action.onClick} />
          ))}
          </> : <>
          {actions2.map((action, index) => (
            <ActionButton key={index} icon={action.icon} label={action.label}
              onClick={action.onClick} />
          ))}
          </> }
        </div>

        <div className="about-section">
          <div className="about-header">
            <h3>About this Outreach</h3>
            <div className="about-actions">
              {/* <Button icon={ <CaretDownOutlined /> }>Actions </Button> */}
              {/* <Settings /> */}
            </div>
          </div>

          <div className="contact-fields">
            <div className="field">
              <p className="label">Email</p>
              <div className="email">
                <a>
                  <div
                    onClick={() => { window.location.href = `mailto:${outReachData.email}`; }}
                  >{outReachData.email}</div>
                </a>


              </div>
            </div>
            <div className="field">
              <p className="label">Phone </p>
              <a >
                <div
                  onClick={() => { window.location.href = `tel:${outReachData.phone}`; }}
                >{outReachData.phone}</div>
              </a>

            </div>
            <div className="field">
              <p className="label">Created By </p>
              <a >
                <div
                >{outReachData?.createdBy?.name}</div>
              </a>

            </div>
            {/* <div className="field">
              <p className="label">Contact owner</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewOutReach = () => {

  const [form] = Form.useForm();
  const [outReachData, setOutReachData] = useState({})
  const paramsId = useParams()
  const navigate = useNavigate();
  const [modalOpen, setmodalOpen] = useState(false)

  const fetchOutReachDataById = async () => {
    try {

      const data = await getOutreachDataById(paramsId.id)
      setOutReachData(data)

    } catch (error) {
      console.log(error);

    }
  }
  const modalOpenForNote=()=>{
    setmodalOpen(true)
  }
  const modalCloseForNote=()=>{
    setmodalOpen(false)
    form.resetFields()
  }
  useEffect(() => {
    fetchOutReachDataById()
  }, [])
  return (
    <div className="contact-management">
      <Sidebar outReachData={outReachData} modalOpenForNote={modalOpenForNote} />
      < MainContent form={form} outReachData={outReachData}  modalOpen={modalOpen}
      modalOpenForNote={modalOpenForNote} modalClose={modalCloseForNote}/>
    </div>
  );
};



export default ViewOutReach; 