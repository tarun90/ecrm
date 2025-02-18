import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  let userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null
  const [user, setUser] = useState(userData);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_TM_API_URL}/api/auth/login`, credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      
      setUser(user);
      localStorage.setItem('userData', JSON.stringify(user));
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      throw error;
    }
  };

  const authenticatedData = async (User, token)=>{
    localStorage.setItem('userData', JSON.stringify(User));
    setUser(user);
    setIsAuthenticated(true);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('isWebMailLoggedin');

    localStorage.removeItem('googleAccessToken');
    localStorage.removeItem('googleTokenExpiry');
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, authenticatedData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};