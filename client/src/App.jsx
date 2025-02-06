import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Login from './pages/login/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ContactListAndAdd from './pages/contacts/ContactListAndAdd';
import Deals from './pages/Deals/Deals';
import Dashboard from './pages/Dashboard/Dashboard';
import Tasks from './pages/tasks/Tasks';
import Products from './pages/Product/Products';
import Invoices from './pages/Invoice/Invoices';
import './App.css';
import "./variable.css"
import "./Antdesign.css"

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  let token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: '#03497a',
          // Alias Token
          colorBgContainer: '#f6ffed',
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route

              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/deals"
              element={
                <PrivateRoute>
                  <Deals />
                </PrivateRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <PrivateRoute>
                  <ContactListAndAdd />
                </PrivateRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <PrivateRoute>
                  <Tasks />
                </PrivateRoute>
              }
            />
            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <Products />
                </PrivateRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <PrivateRoute>
                  <Invoices />
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