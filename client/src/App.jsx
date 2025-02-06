import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Login from './pages/login/Login';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import ContactListAndAdd from './pages/contacts/ContactListAndAdd';
import Deals from './pages/Deals/Deals';
import Dashboard from './pages/Dashboard/Dashboard';
import "./variable.css"
import EventManager from "./pages/EvenetManager/EventManager"
import Tasks from './pages/tasks/Tasks';
import MainLayout from './components/MainLayout';
import "./Antdesign.css";

const PrivateRoute = ({ children }) => {
  let token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#03497a',
          colorBgContainer: '#f6ffed',
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Private Routes inside MainLayout */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/deals" element={<Deals />} />
                      <Route path="/contacts" element={<ContactListAndAdd />} />
                      <Route path="/event-manager" element={<EventManager />} />
                      <Route path="/tasks" element={<Tasks />} />
                    </Routes>
                  </MainLayout>
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
  