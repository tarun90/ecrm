import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { userEmail } = useAuth();
  console.log('PrivateRoute check:', { userEmail });
  return userEmail ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { userEmail } = useAuth();
  console.log('AppContent render:', { userEmail });

  return (
    <Routes>
      <Route path="/login" element={
        userEmail ? <Navigate to="/" /> : <Login />
      } />
      <Route path="/*" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App; 