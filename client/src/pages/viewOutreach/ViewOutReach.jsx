import React, { useEffect, useState } from 'react';
import { Settings, Plus, ArrowLeft, Edit, Mail, Phone, Calendar, MoreHorizontal, Copy, Paperclip, Trash2 } from 'lucide-react';
import './ViewOutReach.css';
import { Button, Checkbox, DatePicker, Divider, Form, Input, message, Modal, Upload, Card, Empty, List, Popconfirm, Space, Typography, Tooltip, Collapse } from 'antd';
import {
  CaretDownOutlined, UploadOutlined, DeleteOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { getOutreachDataById } from '../OutReach/outreachService';
import { useNavigate, useParams } from 'react-router-dom';
import { createNote, getNotesByOutreach, updateNote, deleteNote } from './noteService';
import moment from 'moment';
import { Header } from 'antd/es/layout/layout';
import NoDataUI from '../../components/NoData';
const ActionButton = ({ icon, label, onClick }) => {
  return (
    <div className="action-button">
      <button className="icon-button" onClick={ onClick }>{ icon }</button>
      <span className="button-label">{ label }</span>
    </div>
  );
};


const { Panel } = Collapse;
const { Text, Link } = Typography;
const MainContent = ({ form, outReachData, modalOpen, modalOpenForNote, modalClose }) => {
  const activities = [
    {
      key: "1",
      title: "Logged call",
      author: "Tarun Bansal",
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      date: "Feb 19, 2025 at 12:00 PM GMT+5:30",
    },
    {
      key: "2",
      title: "Note",
      author: "Tarun Bansal",
      description: "Call done",
      date: "Feb 19, 2025 at 12:00 PM GMT+5:30",
    },
    {
      key: "3",
      title: "Deal activity",
      author: "Tarun Bansal",
      description: (
        <>
          <Text strong>Tarun Bansal</Text> moved deal to Appointment scheduled.{ " " }
          <Link href="#" target="_blank">
            View details
          </Link>
        </>
      ),
      date: "Feb 5, 2025 at 6:15 PM GMT+5:30",
    },
  ];
  let userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userDate')) : {}
  const sections = ['Notes'];
  const checkBoxOptions = ["Email", "Phone", "IM", "Linkedin"];
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await getNotesByOutreach(outReachData?._id);
      setNotes(fetchedNotes);
    } catch (error) {
      message.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (outReachData?._id) {
      fetchNotes();
    }
  }, [outReachData?._id]);
  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId);
      message.success('Note deleted successfully!');
      fetchNotes();
    } catch (error) {
      message.error('Failed to delete note: ' + (error.message || 'Unknown error'));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingNote) {
        await updateNote(editingNote._id, values);
        message.success('Note updated successfully!');
      } else {
        await createNote(outReachData?._id, values);
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
    <div className="main-content-wrapper">
      { sections.map((section) => (
        <div key={ section } className="content-section">
          <Header className="section-header">
            <h2>{ section }</h2>
            <div className="header-actions">
              {/* {userData?.department?.name?.toLowerCase() == 'outreach team' && */ }
              <Button
                type="primary"
                icon={ <PlusOutlined /> }
                onClick={ modalOpenForNote }
              >
                Add
              </Button>
              {/* } */ }
              {/* <Settings /> */ }
            </div>
          </Header>
          {/* <div className="section-content">
                 <p>No associated objects of this type exist or you don't have permission to view them.</p>
               </div> */}
          <>
          {!notes || notes.length == 0 ?
          <NoDataUI />
        :
            <Collapse
              size="large"
              expandIcon={ ({ isActive }) => (
                <RightOutlined rotate={ isActive ? 90 : 0 } />
              ) }
              ghost
            >{
              notes?.map((note)=>(
                <Panel
                key={ note?._id }
                header={
                  <Text strong>
                   Note Added  <Text type="secondary">by { note?.createdBy?.name }</Text>
                  </Text>
                }
                extra={ <Text type="secondary">{ moment(note?.createdAt).format('DD-MM-YYYY HH:mm') }</Text> }
              >
                 <Text strong>Contacted Through : </Text>  <Text>{ note?.contactMethod?.toString() }</Text>
               <br/>
               <Text strong>Message : </Text>  <Text>{ note?.message }</Text><br/>
            {note?.reminderDate && <><Text strong>Reminder Date : </Text>  <Text>{ moment(note?.reminderDate).format('DD-MM-YYYY HH:mm') }</Text> <br/></>}
              {note?.attachment && <> <Text strong>Attachment : </Text><a target="_blank" href={`${import.meta.env.VITE_TM_API_URL}/${note?.attachment?.path}`}>{note?.attachment?.filename}</a></>}
              </Panel>
              ))
            }
              {/* { activities.map((activity) => (
                <Panel
                  key={ activity.key }
                  header={
                    <Text strong>
                      { activity.title } <Text type="secondary">by { activity.author }</Text>
                    </Text>
                  }
                  extra={ <Text type="secondary">{ activity.date }</Text> }
                >
                  <Text>{ activity.description }</Text>
                </Panel>
              )) } */}
            </Collapse>
}
          </>
        </div>
      )) }
      <Modal
        title={ `${editingNote ? 'Edit' : 'Add'} Note - ${outReachData?.name}` }
        open={ modalOpen }
        onCancel={ handleModalClose }
        footer={ null }
        width={ 600 }
      >
        <Divider />
        <Form
          form={ form }
          layout="vertical"
          onFinish={ handleSubmit }
        >
          <div style={ { borderBottom: "1px solid #ddd", paddingBottom: "15px", marginBottom: "20px" } }>
            <h3 style={ { fontSize: "16px", marginBottom: "10px" } }>Contacted Through</h3>
            <Form.Item name="options">
              <Checkbox.Group options={ checkBoxOptions } />
            </Form.Item>
          </div>

          <div>
            <h3 style={ { fontSize: "16px", marginBottom: "10px" } }>Notes</h3>
            <Form.Item
              label="Message"
              name="message"
              rules={ [{ required: true, message: "Please enter a message!" }] }
            >
              <Input.TextArea placeholder="Enter your message..." rows={ 3 } />
            </Form.Item>

            <Form.Item
              label="Attachment"
              name="attachment"
              valuePropName="fileList"
              getValueFromEvent={ normFile }
            >
              <Upload
                beforeUpload={ () => false }
                maxCount={ 1 }
                listType="text"
              >
                <Button icon={ <UploadOutlined /> } className='filter-btn'>Upload Attachment</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              label="Add Reminder"
              name="reminder"
            >
              <DatePicker
                showTime={ { format: 'HH:mm:ss' } }
                className="w-full"
                placeholder="Select date"
                style={ { width: "100%" } }
              />
            </Form.Item>
          </div>
          <Divider />

          <div style={ { textAlign: "right", marginTop: "20px" } }>
            <Button style={ { marginRight: 10 } } className='text-btn' onClick={ handleModalClose }>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              { editingNote ? 'Update' : 'Save' }
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ outReachData, modalOpenForNote }) => {
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
    {
      icon: <Edit />, label: 'Note', onClick: () => {
        modalOpenForNote()
      }
    },
    {
      icon: <Mail />, label: 'Email',
      onClick: () => {
        window.location.href = `mailto:${outReachData?.email}`;
      }
    },
    {
      icon: <Phone />, label: 'Call',
      onClick: () => window.location.href = `tel:${outReachData?.phone}`
    },

    // { icon: <Edit />, label: 'Task' },
    // { icon: <Calendar />, label: 'Meeting' },
    // { icon: <MoreHorizontal />, label: 'More' }
  ];

  const actions2 = [

    {
      icon: <Mail />, label: 'Email',
      onClick: () => {
        window.location.href = `mailto:${outReachData?.email}`;
      }
    },
    {
      icon: <Phone />, label: 'Call',
      onClick: () => window.location.href = `tel:${outReachData?.phone}`
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
        <ArrowLeft className="back-icon" onClick={ () => navigate(-1) } />
        <span>Outreach details</span>
        {/* <Button icon={ <CaretDownOutlined /> }>Actions </Button> */ }
      </div>

      <div className="contact-card scroll">
        <div className="contact-info">
          <div className="avatar">{ outReachData?.name?.at(0) }</div>
          <div className="contact-details">
            <h2>{ outReachData?.name }</h2>
            {/* <h3>Blanden</h3> */ }
            <Button className="email" onClick={ () => {
              navigator.clipboard.writeText(outReachData?.email).then(() => {
                message.success('Mail copied!')
              })

            } }>
              <a >{ outReachData?.email }</a>
              <Copy />
            </Button>

          </div>
        </div>

        <div className="action-buttons">
          { userData?.department?.name?.toLowerCase == 'outreach team' ? <>
            { actions2.map((action, index) => (
              <ActionButton key={ index } icon={ action.icon } label={ action.label }
                onClick={ action.onClick } />
            )) }
          </> : <>
            { actions2.map((action, index) => (
              <ActionButton key={ index } icon={ action.icon } label={ action.label }
                onClick={ action.onClick } />
            )) }
          </> }
        </div>

        <div className="about-section">
          <div className="about-header">
            <h3>About this Outreach</h3>
            <div className="about-actions">
              {/* <Button icon={ <CaretDownOutlined /> }>Actions </Button> */ }
              {/* <Settings /> */ }
            </div>
          </div>

          <div className="contact-fields">
            <div className="field">
              <p className="label">Email</p>
              <div className="email">
                <a>
                  <div
                    onClick={ () => { window.location.href = `mailto:${outReachData?.email}`; } }
                  >{ outReachData?.email }</div>
                </a>


              </div>
            </div>
            <div className="field">
              <p className="label">Phone </p>
              <a >
                <div
                  onClick={ () => { window.location.href = `tel:${outReachData?.phone}`; } }
                >{ outReachData?.phone }</div>
              </a>

            </div>


            <div className="field">
              <p className="label">Designation:  </p>
              <p >
                <div
                >{ outReachData?.designation }</div>
              </p>

            </div>

            <div className="field">
              <p className="label">Created By:  </p>
              <p >
                <div
                >{ outReachData?.createdBy?.name }</div>
              </p>

            </div>
            <div className="field">
              <p className="label">Region:  </p>
              <p >
                <div
                >{ outReachData?.region?.regionName }</div>
              </p>

            </div>

            <div className="field">
              <p className="label">City:  </p>
              <p >
                <div
                >{ outReachData?.city }</div>
              </p>

            </div>

            <div className="field">
              <p className="label">Country:  </p>
              <p >
                <div
                >{ outReachData?.country }</div>
              </p>

            </div>
            <div className="field">
              <p className="label">Website:  </p>
              <a href={`${outReachData?.website}`} >
                <div
                >{ outReachData?.website }</div>
              </a>

            </div>

            <div className="field">
              <p className="label">Linkedin:  </p>
              <a href={`${outReachData?.linkedin}`} >
                <div
                >{ outReachData?.linkedin }</div>
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
  const modalOpenForNote = () => {
    setmodalOpen(true)
  }
  const modalCloseForNote = () => {
    setmodalOpen(false)
    form.resetFields()
  }
  useEffect(() => {
    fetchOutReachDataById()
  }, [])
  return (
    <div className="contact-management">
      <Sidebar outReachData={ outReachData } modalOpenForNote={ modalOpenForNote } />
      < MainContent form={ form } outReachData={ outReachData } modalOpen={ modalOpen }
        modalOpenForNote={ modalOpenForNote } modalClose={ modalCloseForNote } />
    </div>
  );
};



export default ViewOutReach; 