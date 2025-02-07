import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './WebMailLogin.css';

const WebMailLogin = () => {
  const [error, setError] = useState('');
  const [isTokenAvailable, setIsTokenAvailable] = useState(false);
  const location = useLocation();
  const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {};
  const isWebMailLoggedin = localStorage.getItem('isWebMailLoggedin') ? localStorage.getItem('userData') : false;
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("isWebMailLoggedin", true);
      navigate('/webmail');
  }
    const errorMsg = params.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
    }
  }, [location]);
  useEffect(()=>{
    if(userData?.tokens){
      setIsTokenAvailable(true);
    }
  })
  useEffect(()=>{
    if(isTokenAvailable || isWebMailLoggedin){
      navigate('/webmail');
     }

  },[isTokenAvailable])
  

  const handleLogin = async () => {
    try {
      setError('');
      const response = await axios.get(`${import.meta.env.VITE_TM_API_URL}/api/auth/url`);
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      setError('Failed to start authentication process');
    }
  };

  return (
    <div className="webmail-login-container">
      <div className="webmail-login-box">
        <h1>Gmail Client</h1>
        <p className="webmail-subtext">Connect with Gmail to manage your emails efficiently.</p>

        {error && <div className="error-message">{error}</div>}

        <button onClick={handleLogin} className="webmail-login-button">
          Connect with Gmail
        </button>
      </div>
    </div>
  );
};

export default WebMailLogin; 