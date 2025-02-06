import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Input, Select, DatePicker, Modal, message } from 'antd';
import {
  PlusOutlined,
  FilterOutlined,
  ReloadOutlined,
  UserOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined
} from '@ant-design/icons';
import "./Tasks.css"
import dayjs from 'dayjs';
import MainLayout from '../../components/MainLayout';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    owner: '',
    startDate: '',
    dueDate: '',
    status: 'Pending',
  });
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ owner: '', dueDate: '' });
  

  const url = import.meta.env.VITE_TM_API_URL;
  
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    
    const response = await axios.get(`${import.meta.env.VITE_TM_API_URL}/api/tasks`,{ baseURL: "" });

    const currentDate = new Date();

    // Separate upcoming and past due tasks
    const completedTasks = response.data.filter(task => task.status === 'Completed');
    const upcomingTasks = response.data.filter(task => task.status !== 'Completed' && new Date(task.dueDate) >= currentDate);
    const pastTasks = response.data.filter(task => task.status !== 'Completed' && new Date(task.dueDate) < currentDate);

    // Sort both groups in ascending order
    upcomingTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    pastTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    setTasks(response.data);setTasks([...completedTasks, ...upcomingTasks, ...pastTasks]);
  };

  const handleInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
  };

  const handleClearFilter = () => {
    setFilters({ owner: '', dueDate: '' });
    fetchTasks();
  };

  const handleAddTask = async () => {
    await axios.post(`${url}/api/tasks`, newTask);
    message.success('Task added successfully!');
    setShowModal(false);
    fetchTasks();
    setNewTask({ name: '', owner: '', startDate: '', dueDate: '', status: 'Pending' });
  };

  const handleUpdateTask = async () => {
    try {
      await axios.put(`${url}/api/tasks/${editingTask._id}`, editingTask);
      message.success('Task updated successfully!');
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      message.error('Error updating task');
      console.error('Error updating task:', err);
    }
  };

  

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const generateReport = async () => {
    const response = await axios.get(`${url}/api/tasks/report`, { params: filters });
    setTasks(response.data);
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${url}/api/tasks/${id}`);
      message.success("Task deleted successfully");
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  return (
    <MainLayout>
    <div className="app-container">
      <nav className="top-nav">
        <div className="nav-content">
         
          <div className="nav-actions">
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setShowFilters(!showFilters)}
              className="filter-btn"
            >
              Filter
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setShowModal(true)}
              className="create-btn"
            >
              Add Task
            </Button>
          </div>
        </div>
      </nav>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-content">
            <Input
             
              className="filter-input"
              name="owner"
              placeholder="Filter by Owner"
              value={filters.owner}
              onChange={handleFilterChange}
            />
            <DatePicker
              className="filter-input"
              onChange={(date) => setFilters({ ...filters, dueDate: date })}
            />
            <Button 
              type="primary" 
              icon={<FilterOutlined />} 
              onClick={generateReport}
              className="apply-filter-btn"
            >
              Apply Filters
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleClearFilter}
              className="clear-filter-btn"
            >
              Clear
            </Button>

            <Button 
              icon={<CloseOutlined />}
              onClick={()=>setShowFilters(false)}
            style={{background:"red"}}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <div className="board-container">
        <div className="board-column">
          <h2 className="column-title">New Tasks</h2>
          <div className="tasks-container">
            {tasks.filter(task => task.status === 'Pending').map(task => (
              <div key={task._id} style={{ backgroundColor: task.status !== 'Completed' && new Date(task.dueDate) < new Date() ? '#ffcccb' : 'white' }} className="task-card">
                <div className="task-header">
                  <h3 className="task-title">{task.name}</h3>
                  <div className="task-actions">
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={() => setEditingTask(task)} 
                    />
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDeleteTask(task._id)}
                      danger 
                    />
                  </div>
                </div>
                <div className="task-info">
                  <div className="info-item">
                    <UserOutlined />
                    <span>{task.owner}</span>
                  </div>
                  <div className="info-item">
                    <CalendarOutlined />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={`task-status ${task.status !== 'Completed' && new Date(task.dueDate) < new Date() ? 'due' : ''} ${task.status.toLowerCase().replace(' ', '-')}`}>
                  {task.status !== 'Completed' && new Date(task.dueDate) < new Date() ? 'Due' : task.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="board-column">
          <h2 className="column-title">In Progress</h2>
          <div className="tasks-container">
            {tasks.filter(task => task.status === 'In Progress').map(task => (
              <div key={task._id} style={{ backgroundColor: task.status !== 'Completed' && new Date(task.dueDate) < new Date() ? '#ffcccb' : 'white' }} className="task-card">
                <div className="task-header">
                  <h3 className="task-title">{task.name}</h3>
                  <div className="task-actions">
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={() => setEditingTask(task)} 
                    />
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDeleteTask(task._id)}
                      danger 
                    />
                  </div>
                </div>
                <div className="task-info">
                  <div className="info-item">
                    <UserOutlined />
                    <span>{task.owner}</span>
                  </div>
                  <div className="info-item">
                    <CalendarOutlined />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={`task-status ${task.status !== 'Completed' && new Date(task.dueDate) < new Date() ? 'due' : ''} ${task.status.toLowerCase().replace(' ', '-')}`}>
                  {task.status !== 'Completed' && new Date(task.dueDate) < new Date() ? 'Due' : task.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="board-column">
          <h2 className="column-title">Completed</h2>
          <div className="tasks-container">
            {tasks.filter(task => task.status === 'Completed').map(task => (
              <div key={task._id} className="task-card">
                <div className="task-header">
                  <h3 className="task-title">{task.name}</h3>
                  <div className="task-actions">
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={() => setEditingTask(task)} 
                    />
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDeleteTask(task._id)}
                      danger 
                    />
                  </div>
                </div>
                <div className="task-info">
                  <div className="info-item">
                    <UserOutlined />
                    <span>{task.owner}</span>
                  </div>
                  <div className="info-item">
                    <CalendarOutlined />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={`task-status ${task.status.toLowerCase().replace(' ', '-')}`}>
                  {task.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        title="Add New Task"
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowModal(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" className='update-btn' onClick={handleAddTask}>
            Add Task
          </Button>
        ]}
      >
        <div className="modal-content">
          
          <Input
            placeholder="Task Name"
            name="name"
            value={newTask.name}
            onChange={handleInputChange}
          />
          <Input
            // prefix={<UserOutlined />}
            placeholder="Owner"
            name="owner"
            value={newTask.owner}
            onChange={handleInputChange}
          />
          <div className="date-inputs">
            <DatePicker
              placeholder="Start Date"
              onChange={(date) => setNewTask({ ...newTask, startDate: date })}
            />
            <DatePicker
              placeholder="Due Date"
              onChange={(date) => setNewTask({ ...newTask, dueDate: date })}
            />
          </div>
          <Select
            placeholder="Status"
            value={newTask.status}
            onChange={(value) => setNewTask({ ...newTask, status: value })}
            style={{ width: '100%' }}
          >
            <Select.Option value="Pending">Pending</Select.Option>
            <Select.Option value="In Progress">In Progress</Select.Option>
            <Select.Option value="Completed">Completed</Select.Option>
          </Select>
        </div>
      </Modal>

      <Modal
        title="Edit Task"
        open={editingTask !== null}
        onCancel={() => setEditingTask(null)}
        footer={[
          <Button key="cancel" onClick={() => setEditingTask(null)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" className='update-btn' onClick={handleUpdateTask}>
            Update Task
          </Button>
        ]}
      >
        <div className="modal-content">
          <Input
            placeholder="Task Name"
            name="name"
            value={editingTask?.name}
            onChange={handleEditInputChange}
          />
          <Input
         
            placeholder="Owner"
            name="owner"
            value={editingTask?.owner}
            onChange={handleEditInputChange}
          />
          <div className="date-inputs">
            <DatePicker
              placeholder="Start Date"
              onChange={(date) =>
                setEditingTask({ ...editingTask, startDate: date })
              }
              value={editingTask?.startDate ? dayjs(editingTask.startDate) : null}

  
              // value={editingTask?.startDate}
              // onChange={(date) => setEditingTask({ ...editingTask, startDate: date })}
            />
            <DatePicker
              placeholder="Due Date"
              value={editingTask?.dueDate ? dayjs(editingTask.dueDate) : null}
            onChange={(date) =>
              setEditingTask({ ...editingTask, dueDate: date })
            }

              // value={editingTask?.dueDate}
              // onChange={(date) => setEditingTask({ ...editingTask, dueDate: date })}
            />
          </div>
          <Select
            placeholder="Status"
            value={editingTask?.status}
            onChange={(value) => setEditingTask({ ...editingTask, status: value })}
            style={{ width: '100%' }}
          >
            <Select.Option value="Pending">Pending</Select.Option>
            <Select.Option value="In Progress">In Progress</Select.Option>
            <Select.Option value="Completed">Completed</Select.Option>
          </Select>
        </div>
      </Modal>
    </div>
    </MainLayout>
  );
}

export default Tasks;