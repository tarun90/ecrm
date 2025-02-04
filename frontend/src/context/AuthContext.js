import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [sessionToken, setSessionToken] = useState(localStorage.getItem('sessionToken'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Verify existing session
  useEffect(() => {
    const verifySession = async () => {
      if (userEmail && sessionToken) {
        try {
          console.log('Verifying session for:', userEmail);
          const response = await axios.get('http://localhost:5000/api/auth/verify', {
            params: { email: userEmail, token: sessionToken }
          });
          
          if (!response.data.valid) {
            console.log('Session invalid, logging out');
            logout();
          } else {
            console.log('Session valid');
            navigate('/');
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, [userEmail, sessionToken]);

  // Handle login redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const token = params.get('token');

    if (email && token) {
      console.log('Received login credentials:', { email });
      setUserEmail(email);
      setSessionToken(token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('sessionToken', token);
      window.history.replaceState({}, document.title, '/');
      navigate('/');
    }
  }, []);

  const logout = () => {
    console.log('Logging out');
    setUserEmail(null);
    setSessionToken(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('sessionToken');
    navigate('/login');
  };

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      userEmail, 
      sessionToken,
      setUserEmail, 
      setSessionToken,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 