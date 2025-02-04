import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorMsg = params.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
    }
  }, [location]);

  const handleLogin = async () => {
    try {
      setError('');
      const response = await axios.get('http://localhost:5000/api/auth/url');
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      setError('Failed to start authentication process');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Gmail Client</h1>
        {error && <div className="error-message">{error}</div>}
        <button onClick={handleLogin} className="login-button">
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login; 