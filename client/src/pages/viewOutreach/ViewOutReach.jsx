import React, { useEffect, useState } from 'react';
import { Settings, Plus, ArrowLeft, Edit, Mail, Phone, Calendar, MoreHorizontal, Copy } from 'lucide-react';
import './ViewOutReach.css';
import { Button, Checkbox, DatePicker, Divider, Form, Input, message, Modal, Upload } from 'antd';
import { CaretDownOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getOutreachDataById } from '../OutReach/outreachService';
import { useNavigate, useParams } from 'react-router-dom';
const ActionButton = ({ icon, label, onClick }) => {
  return (
    <div className="action-button">
      <button className="icon-button" onClick={onClick}>{icon}</button>
      <span className="button-label">{label}</span>
    </div>
  );
};


// const Notes=(form)=>{
//   const checkBoxOptions = ["Option 1", "Option 2", "Option 3", "Option 4"];
//   return<>

//   <Modal

//       title={`User: `}
//       open={true}
//       // onCancel={onClose}
//       footer={null}
//       width={600}
//     >
//       <Form form={form} layout="vertical"
//       //  onFinish={handleFinish}
//       >
//         {/* Section 1: User Checkboxes */}
//         <Form.Item label="Select Options" name="options">
//           <Checkbox.Group options={checkBoxOptions} />
//         </Form.Item>

//         {/* Section 2: Notes */}
//         <Form.Item
//           label="Message"
//           name="message"
//           rules={[{ required: true, message: "Please enter a message!" }]}
//         >
//           <Input.TextArea placeholder="Enter your message..." rows={3} />
//         </Form.Item>

//         {/* File Upload */}
//         <Form.Item label="Attachment" name="attachment">
//           <Upload beforeUpload={() => false}>
//             <Button icon={<UploadOutlined />}>Upload Attachment</Button>
//           </Upload>
//         </Form.Item>

//         {/* Date Picker */}
//         <Form.Item label="Add Reminder" name="reminder">
//           <DatePicker className="w-full" placeholder="Select date" />
//         </Form.Item>

//         {/* Modal Footer: Submit & Cancel Buttons */}
//         <Form.Item className="text-right">
//           <Button
//           //  onClick={onClose} 
//            style={{ marginRight: 10 }}>
//             Cancel
//           </Button>
//           <Button type="primary" htmlType="submit">
//             Save
//           </Button>
//         </Form.Item>
//       </Form>
//     </Modal></>
// }

const MainContent = ({ form, outReachData,modalOpen, modalOpenForNote,modalClose}) => {
  const sections = ['Notes'];
  const checkBoxOptions = ["Email", "Phone", "IM", "Linkdin"];

  return (
    <div className="main-content">
      {sections.map((section) => (
        <div key={section} className="content-section">
          <div className="section-header">
            <h2>{section}</h2>
            <div className="header-actions">
              <button className="add-button add-contact-btn"onClick={modalOpenForNote} >
                <Plus />
                add
              </button>
              {/* <Settings /> */}
            </div>
          </div>
          <div className="section-content">
            <p>No associated objects of this type exist or you don't have permission to view them.</p>
          </div>
        </div>
      ))}

<Modal
  title={`${outReachData.name}`}
  open={modalOpen}
  onCancel={modalClose}
  footer={null}
  width={600}
>
  <Divider></Divider>
  <Form form={form} layout="vertical">
    {/* ✅ Section 1: User Selection */}
    <div style={{ borderBottom: "1px solid #ddd", paddingBottom: "15px", marginBottom: "20px" }}>
      <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Contacted Through</h3>
      <Form.Item name="options">
        <Checkbox.Group options={checkBoxOptions} />
      </Form.Item>
    </div>

    {/* ✅ Section 2: Notes */}
    <div>
      <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Notes</h3>

      {/* Message */}
      <Form.Item
        label="Message"
        name="message"
        rules={[{ required: true, message: "Please enter a message!" }]}
      >
        <Input.TextArea placeholder="Enter your message..." rows={3} />
      </Form.Item>

      {/* File Upload */}
      <Form.Item label="Attachment" name="attachment">
        <Upload beforeUpload={() => false}>
          <Button icon={<UploadOutlined />}>Upload Attachment</Button>
        </Upload>
      </Form.Item>

      {/* Date Picker */}
      <Form.Item label="Add Reminder" name="reminder"
      rules={[{ required: true, message: "Please enter a reminder!" }]}>
        <DatePicker showTime={{ format: 'HH:mm:ss' }} className="w-full" placeholder="Select date" style={{ width: "100%" }} />
      </Form.Item>
    </div>
    <Divider></Divider>

    {/* ✅ Modal Footer: Submit & Cancel Buttons */}
    <div style={{ textAlign: "right", marginTop: "20px" }}>
      <Button 
      // onClick={onClose}
       style={{ marginRight: 10 }} onClick={()=>{modalClose()}}>
        Cancel
      </Button>
      <Button type="primary" htmlType="submit">
        Save
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
          {actions.map((action, index) => (
            <ActionButton key={index} icon={action.icon} label={action.label}
              onClick={action.onClick} />
          ))}
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