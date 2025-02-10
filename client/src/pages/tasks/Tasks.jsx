import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Input, Select, DatePicker, Modal, message, Form } from "antd";
import {
  PlusOutlined,
  FilterOutlined,
  ReloadOutlined,
  UserOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "./Tasks.css";
import dayjs from "dayjs";
import MainLayout from "../../components/MainLayout";

function Tasks() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    owner: "",
    startDate: "",
    dueDate: "",
    status: "Pending",
  });
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ owner: "", dueDate: "" });

  const url = import.meta.env.VITE_TM_API_URL;

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_TM_API_URL}/api/tasks`,
      { baseURL: "" }
    );

    const currentDate = new Date();

    // Separate upcoming and past due tasks
    const completedTasks = response.data.filter(
      task => task.status === "Completed"
    );
    const upcomingTasks = response.data.filter(
      task =>
        task.status !== "Completed" && new Date(task.dueDate) >= currentDate
    );
    const pastTasks = response.data.filter(
      task =>
        task.status !== "Completed" && new Date(task.dueDate) < currentDate
    );

    // Sort both groups in ascending order
    upcomingTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    pastTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    setTasks(response.data);
    setTasks([...completedTasks, ...upcomingTasks, ...pastTasks]);
  };

  const handleInputChange = e => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = e => {
    setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
  };

  const handleClearFilter = () => {
    setFilters({ owner: "", dueDate: "" });
    fetchTasks();
  };

  const handleAddTask = async () => {
    await axios.post(`${url}/api/tasks`, newTask);
    message.success("Task added successfully!");
    setShowModal(false);
    fetchTasks();
    form.resetFields();

    setNewTask({
      name: "",
      owner: "",
      startDate: "",
      dueDate: "",
      status: "Pending",
    });
  };

  const handleUpdateTask = async () => {
    try {
      await axios.put(`${url}/api/tasks/${editingTask._id}`, editingTask);
      message.success("Task updated successfully!");
      setEditingTask(null);
      fetchTasks();
      editForm.resetFields();
    } catch (err) {
      message.error("Error updating task");
      console.error("Error updating task:", err);
    }
  };

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const generateReport = async () => {
    const response = await axios.get(`${url}/api/tasks/report`, {
      params: filters,
    });
    setTasks(response.data);
  };

  const handleDeleteTask = async id => {
    try {
      await axios.delete(`${url}/api/tasks/${id}`);
      message.success("Task deleted successfully");
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <>
      <div className="app-container add-task-dashboard">
        <div className="top-nav">
          <div className="nav-content">

            { showFilters && (
              <div className="filters-panel">
                <div className="filters-content">
                  <Input
                    className="filter-input"
                    name="owner"
                    placeholder="Filter by Owner"
                    value={ filters.owner }
                    onChange={ handleFilterChange }
                  />
                  <DatePicker
                    className="filter-input"
                    onChange={ date => setFilters({ ...filters, dueDate: date }) }
                  />
                  <Button
                    type="primary"
                    icon={ <FilterOutlined /> }
                    onClick={ generateReport }
                    className="apply-filter-btn"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    icon={ <ReloadOutlined /> }
                    onClick={ handleClearFilter }
                    className="text-btn"
                  >
                    Clear
                  </Button>

                  <Button
                    icon={ <CloseOutlined /> }
                    onClick={ () => setShowFilters(false) }
                    className="delete-btn"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) }
            <div className="nav-actions">
              <Button
                icon={ <FilterOutlined /> }
                onClick={ () => setShowFilters(!showFilters) }
                className="filter-btn"
              >
                Filter
              </Button>
              <Button
                type="primary"
                icon={ <PlusOutlined /> }
                onClick={ () => setShowModal(true) }
                className="create-btn"
              >
                Add Task
              </Button>
            </div>
          </div>
        </div>



        <div className="board-container">
          <div className="board-column">
            <h2 className="column-title">New Tasks</h2>
            <div className="tasks-container scroll">
              { tasks
                .filter(task => task.status === "Pending")
                .map(task => (
                  <div
                    key={ task._id }
                    style={ {
                      background:
                        task.status === "Pending"
                          ?
                          " linear-gradient(45deg, rgb(7, 191, 228), rgb(148, 237, 255))"
                          : "white",
                    } }
                    className="task-card"
                  >

                    <div className="task-header">
                      <h3 className="task-title">{ task.name }</h3>
                      <div className="task-actions">
                        <Button
                          type="text"
                          icon={ <EditOutlined /> }
                          onClick={ () => setEditingTask(task) }
                        />
                        <Button
                          type="text"
                          icon={ <DeleteOutlined /> }
                          onClick={ () => handleDeleteTask(task._id) }
                          danger
                        />
                      </div>
                    </div>
                    <div className="task-info">
                      <div className="info-item">
                        <UserOutlined />
                        <span>{ task.owner }</span>
                      </div>
                      <div className="info-item">
                        <CalendarOutlined />
                        <span>
                          { new Date(task.dueDate).toLocaleDateString() }
                        </span>
                      </div>
                    </div>
                    <div
                      className={ `task-status ${task.status !== "Completed" && new Date(task.dueDate) < new Date() ? "due" : ""} ${task.status.toLowerCase().replace(" ", "-")}` }
                    >
                      { task.status !== "Completed" &&
                        new Date(task.dueDate) < new Date()
                        ? "Due"
                        : task.status }
                    </div>
                  </div>
                )) }
            </div>
          </div>

          <div className="board-column">
            <h2 className="column-title">In Progress</h2>
            <div className="tasks-container scroll">
              { tasks
                .filter(task => task.status === "In Progress")
                .map(task => (
                  <div
                    key={ task._id }
                    style={ {
                      background:
                        task.status !== "Completed" &&
                          new Date(task.dueDate) < new Date()
                          ? " linear-gradient(45deg, rgb(255, 82, 82), rgb(244, 143, 177))"
                          : " linear-gradient(45deg, rgb(255, 82, 82), rgb(244, 143, 177))",
                    } }
                    className="task-card"
                  >
                    <div className="task-header">
                      <h3 className="task-title">{ task.name }</h3>
                      <div className="task-actions">
                        <Button
                          type="text"
                          icon={ <EditOutlined /> }
                          onClick={ () => setEditingTask(task) }
                        />
                        <Button
                          type="text"
                          icon={ <DeleteOutlined /> }
                          onClick={ () => handleDeleteTask(task._id) }
                          danger
                        />
                      </div>
                    </div>
                    <div className="task-info">
                      <div className="info-item">
                        <UserOutlined />
                        <span>{ task.owner }</span>
                      </div>
                      <div className="info-item">
                        <CalendarOutlined />
                        <span>
                          { new Date(task.dueDate).toLocaleDateString() }
                        </span>
                      </div>
                    </div>
                    <div
                      className={ `task-status ${task.status !== "Completed" && new Date(task.dueDate) < new Date() ? "due" : ""} ${task.status.toLowerCase().replace(" ", "-")}` }
                    >
                      { task.status !== "Completed" &&
                        new Date(task.dueDate) < new Date()
                        ? "Due"
                        : task.status }
                    </div>
                  </div>
                )) }
            </div>
          </div>

          <div className="board-column complet-task">
            <h2 className="column-title">Completed</h2>
            <div className="tasks-container scroll">
              { tasks
                .filter(task => task.status === "Completed")
                .map(task => (
                  <div key={ task._id } className="task-card">
                    <div className="task-header">
                      <h3 className="task-title">{ task.name }</h3>
                      <div className="task-actions">
                        <Button
                          type="text"
                          icon={ <EditOutlined /> }
                          onClick={ () => setEditingTask(task) }
                        />
                        <Button
                          type="text"
                          icon={ <DeleteOutlined /> }
                          onClick={ () => handleDeleteTask(task._id) }
                          danger
                        />
                      </div>
                    </div>
                    <div className="task-info">
                      <div className="info-item">
                        <UserOutlined />
                        <span>{ task.owner }</span>
                      </div>
                      <div className="info-item">
                        <CalendarOutlined />
                        <span>
                          { new Date(task.dueDate).toLocaleDateString() }
                        </span>
                      </div>
                    </div>
                    <div
                      className={ `task-status ${task.status.toLowerCase().replace(" ", "-")}` }
                    >
                      { task.status }
                    </div>
                  </div>
                )) }
            </div>
          </div>
        </div>

        <Modal
          title="Add New Task"
          open={ showModal }
          onCancel={ () => {
            setShowModal(false);
            form.resetFields();
          } }
          footer={ [
            <Button
              key="cancel"
              className="text-btn"
              onClick={ () => {
                setShowModal(false);
                form.resetFields();
              } }
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              className="update-btn"
              onClick={ () => form.submit() }

            // onClick={ handleAddTask }
            >
              Add Task
            </Button>,
          ] }
          width={ 600 }
        >
          <Form layout="vertical" form={ form } onFinish={ handleAddTask }>
            <Form.Item
              name="name"
              label="Task Name"
              rules={ [{ required: true, message: "Please enter task name" }] }
            >
              <Input
                placeholder="Task Name"
                value={ newTask.name }
                name="name"
                onChange={ handleInputChange }
              />
            </Form.Item>

            <Form.Item
              name="owner"
              label="Owner"
              rules={ [{ required: true, message: "Please enter owner name" }] }
            >
              <Input
                name="owner"
                placeholder="Owner"
                value={ newTask.owner }
                onChange={ handleInputChange }
              />
            </Form.Item>

            <Form.Item
              name="startDate"
              label="Start Date"
              rules={ [{ required: true, message: "Please select start date" }] }
            >
              <DatePicker
                style={ { width: "100%" } }
                placeholder="Start Date"
                onChange={ date => setNewTask({ ...newTask, startDate: date }) }
              />
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="Due Date"
              rules={ [{ required: true, message: "Please select due date" }] }
            >
              <DatePicker
                style={ { width: "100%" } }
                placeholder="Due Date"
                onChange={ date => setNewTask({ ...newTask, dueDate: date }) }
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={ [{ required: true, message: "Please select task status" }] }
            >
              <Select
                placeholder="Select Status"
                value={ newTask.status }
                onChange={ value => setNewTask({ ...newTask, status: value }) }
                style={ { width: "100%" } }
              >
                <Select.Option value="Pending">Pending</Select.Option>
                <Select.Option value="In Progress">In Progress</Select.Option>
                <Select.Option value="Completed">Completed</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Edit Task"
          open={ editingTask !== null }
          onCancel={ () => {
            setEditingTask(null);
            editForm.resetFields();
          } }
          footer={ [
            <Button
              key="cancel"
              className="text-btn"
              onClick={ () => {
                setEditingTask(null);
                editForm.resetFields();
              } }
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              className="update-btn"
              onClick={ () => editForm.submit() }
            >
              Update Task
            </Button>,
          ] }
          width={ 600 }
        >
          <Form
            layout="vertical"
            form={ editForm }
            initialValues={ {
              name: editingTask?.name,
              owner: editingTask?.owner,
              startDate: editingTask?.startDate
                ? dayjs(editingTask.startDate)
                : null,
              dueDate: editingTask?.dueDate ? dayjs(editingTask.dueDate) : null,
              status: editingTask?.status,
            } }
            onFinish={ handleUpdateTask }
          >
            <Form.Item
              name="name"
              label="Task Name"
              rules={ [{ required: true, message: "Please enter task name" }] }
            >
              <Input
                name="name"
                placeholder="Task Name"
                value={ editingTask?.name }
                onChange={ handleEditInputChange }
              />
            </Form.Item>

            <Form.Item
              name="owner"
              label="Owner"
              rules={ [{ required: true, message: "Please enter owner name" }] }
            >
              <Input
                name="owner "
                placeholder="Owner"
                value={ editingTask?.owner }
                onChange={ handleEditInputChange }
              />
            </Form.Item>

            <Form.Item
              name="startDate"
              label="Start Date"
              rules={ [{ required: true, message: "Please select start date" }] }
            >
              <DatePicker
                style={ { width: "100%" } }
                placeholder="Start Date"
                value={
                  editingTask?.startDate ? dayjs(editingTask.startDate) : null
                }
                onChange={ date =>
                  setEditingTask({ ...editingTask, startDate: date })
                }
              />
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="Due Date"
              rules={ [{ required: true, message: "Please select due date" }] }
            >
              <DatePicker
                style={ { width: "100%" } }
                placeholder="Due Date"
                value={ editingTask?.dueDate ? dayjs(editingTask.dueDate) : null }
                onChange={ date =>
                  setEditingTask({ ...editingTask, dueDate: date })
                }
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={ [{ required: true, message: "Please select task status" }] }
            >
              <Select
                placeholder="Select Status"
                value={ editingTask?.status }
                onChange={ value =>
                  setEditingTask({ ...editingTask, status: value })
                }
                style={ { width: "100%" } }
              >
                <Select.Option value="Pending">Pending</Select.Option>
                <Select.Option value="In Progress">In Progress</Select.Option>
                <Select.Option value="Completed">Completed</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default Tasks;
